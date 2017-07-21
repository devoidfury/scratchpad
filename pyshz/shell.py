#!/usr/bin/env python3

import atexit
import os
import readline
import sys
import signal
import tempfile


SHELL_NAME = 'pysh'

ESCAPE = '\\'
STRING_DELIM = ['"', "'"]
WHITESPACE = [' ', '\t']

REDIRECTION_IN = '<'
REDIRECTION_OUT = '>'
REDIRECTION = [REDIRECTION_IN, REDIRECTION_OUT]

ERROR_CODES = {
    'CMD_CANNOT_EXECUTE': 126,
    'CMD_NOT_FOUND': 127,
    'RETURN_INVALID': 128,
    'RETURN_OUT_OF_RANGE': 255
}


def builtin_pwd(args):
    print(os.getcwd())
    return 0

def builtin_cd(args):
    try:
        os.chdir(args[1])
        return 0
    except FileNotFoundError:
        print('cd: no such file or directory: {}'.format(args[1]))
        return 1

def _exit(exit_code=0):
    # try to conform to standard returns
    try:
        exit_code = int(exit_code)
    except ValueError:
        exit_code = ERROR_CODES['RETURN_INVALID']
    if exit_code < 0 or exit_code > 255:
        exit_code = ERROR_CODES['RETURN_OUT_OF_RANGE']
    print('<3')
    sys.exit(exit_code)

builtins_ = {
    'pwd': builtin_pwd,
    'cd': builtin_cd
}


# context manager to handle opening and closing files
class FDManager():
    def __init__(self, cmd):
        self.cmd = cmd
        self.files = []

    def __enter__(self):
        sys.stdout.flush()
        sys.stderr.flush()

        for redir in self.cmd.redirections:
            if len(redir) == 3:
                mode = redir.pop()
                self.maybe_open(redir, 0, mode)
                self.maybe_open(redir, 1, mode)
            os.dup2(redir[0], redir[1])
        return self.cmd

    def __exit__(self, type, value, traceback):
        sys.stdout.flush()
        sys.stderr.flush()
        for file in self.files:
             os.close(file)

    def maybe_open(self, redir, idx, mode):
        if isinstance(redir[idx], str):
            redir[idx] = os.open(redir[idx], mode)
            self.files.append(redir[idx])


class Cmd():
    ready = False
    buf = ''
    is_str = False
    current_redirect = None
    parse_error = False
    mode = False

    def __init__(self, line):
        self.args = []
        self.redirections = []
        self.parse(line)

    def __add__(self, line):
        self.parse(line)
        return self

    # returns new read head position
    def parseString(self, line, linelen, delim, start=0):
        if start >= linelen:
            self.is_str = delim
            return linelen

        strEnd = line.find(delim, start)
        if strEnd == -1:
            self.is_str = delim
            self.buf += line
            return linelen

        self.buf += line[start:strEnd]
        self.is_str = False
        return strEnd + 1

    def add_redirection(self):
        redirect = self.current_redirect
        self.current_redirect = None
        redirect[redirect.index(None)] = self.buf
        redirect.append(self.mode)
        self.redirections.append(redirect)

    def parse(self, line):
        linelen = len(line)
        escaped = False
        idx = 0

        if self.is_str: # string continuation case
            idx = self.parseString(line, linelen, self.is_str)

        while idx < linelen:
            c = line[idx]
            idx += 1

            if escaped:
                self.buf += c
                escaped = False
            elif c in STRING_DELIM:
                idx = self.parseString(line, linelen, c, idx)
            elif c in WHITESPACE:
                if self.buf:
                    if self.current_redirect:
                        self.add_redirection()
                    else:
                        self.args.append(self.buf)
                    self.buf = ''
            elif c == ESCAPE:
                escaped = True
            elif c in REDIRECTION:
                if c == REDIRECTION_OUT:
                    redirect = []
                    try:
                        self.mode = os.O_CREAT | os.O_WRONLY
                        if line[idx] != REDIRECTION_OUT:
                            self.mode |= os.O_TRUNC
                        else:
                            self.mode |= os.O_APPEND
                            idx += 1

                        idx_offset = 0
                        if line[idx] == '&' and line[idx+1].isdigit():
                            redirect.append(int(line[idx+1]))
                            self.redirections.append(redirect)
                            idx_offset = 2
                            idx += idx_offset
                        else:
                            redirect.append(None)
                            self.current_redirect = redirect

                        pre_idx = idx - idx_offset
                        if line[pre_idx-2].isdigit() and line[pre_idx-3] in WHITESPACE:
                            redirect.append(int(line[pre_idx-2]))
                            self.buf = ''
                        else:
                            redirect.append(1)
                    except IndexError:
                        self.parse_error = idx
                        return

                elif c == REDIRECTION_IN:
                    self.mode = os.O_RDONLY
                    self.current_redirect = [None, 0]
                    # explicit 0< syntax
                    if line[idx-2] == '0' and line[idx-3] in WHITESPACE:
                        self.buf = ''
            else:
                self.buf += c

        if self.current_redirect:
            if self.buf:
                self.add_redirection()
                self.buf = ''
            else:
                self.parse_error = idx
                return

        # if not ready, then waiting for more input
        self.ready = not self.is_str and not escaped
        # last arg on complete command
        if self.buf and self.ready:
            self.args.append(self.buf)

    def execute(self):
        with FDManager(self):
            try:
                os.execvp(self.args[0], self.args)
            except FileNotFoundError:
                print('{}: command not found: {}'.format(SHELL_NAME, self.args[0]))
                sys.exit(ERROR_CODES['CMD_NOT_FOUND'])
            except PermissionError:
                sys.exit(ERROR_CODES['CMD_CANNOT_EXECUTE'])
            except OSError as e:
                print(e)
                print(e.errno)
                sys.exit(e.errno)

def forward_signal(signum, frame):
    if pid:
        try:
            os.kill(pid, signum)
        except ProcessLookupError:
            pass

def initialize():
    signal.signal(signal.SIGINT, forward_signal)
    histfile = os.path.join(os.path.expanduser('~'), '.pysh_hist')
    try:
        readline.read_history_file(histfile)
        # todo: make this a configuration setting
        readline.set_history_length(1000)
    except FileNotFoundError:
        pass
    atexit.register(readline.write_history_file, histfile)


cmd = None
pid = None
def mainloop():
    global cmd, pid
    while True:
        prompt = '$ ' if cmd is None else '... '

        try:
            line = input(prompt)
        except EOFError:
            print('exit')
            _exit()

        cmd = cmd + line if cmd else Cmd(line)

        if cmd.parse_error != False:
            print('{name}: parse error near here: \n"{line}"\n{error}'.format(
                name=SHELL_NAME,
                line=line,
                error=cmd.parse_error * '-' + '^'))
            cmd = None
            continue

        if not cmd.args:
            cmd = None
            continue

        if not cmd.ready:
            continue

        if cmd.args[0] == 'exit':
            code = (len(cmd.args) > 1) and cmd.args[1] or 0
            _exit(code)

        if builtins_.get(cmd.args[0]):
            res = builtins_[cmd.args[0]](cmd.args)
            cmd = None
            continue

        # this forks a child subprocess *right here*
        # so now we have two processes going forward.
        # pid is 0 in the child process and the pid of the child in the parent
        pid = os.fork()
        if pid == 0:
            cmd.execute() # does not return, process dies after
        else:
            os.wait()
            cmd = None
            pid = None


if __name__ == '__main__':
    initialize()
    mainloop()

# done
# 0. run this code and try `ls` to make sure that much works
# 1. handle arguments (`ls /`)
# 2. don't exit after a command runs (use os.fork and .wait)
# 4. builtins (`cd`, `pwd` for now)
# 5. forward signals (just SIGINT for now, use signal)
# 3. I/O redirection (`echo hi > out`; use os.dup2)

# todo
# 6. pipes (`ls | sort`; use os.pipe)
# 7. job control part 1: handle commands ending in `&`
# 8. job control part 2: Ctrl+Z == SIGSTOP, `jobs`, `fg`, `bg`
# -  customizable prompt, pwd at least
# -  basic completions
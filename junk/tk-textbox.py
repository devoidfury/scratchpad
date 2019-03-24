from tkinter import ttk
import tkinter


# an example of a very simple tk application with a textbox

def main():
    root = tkinter.Tk()
    style = ttk.Style()
    viewport = tkinter.Frame(root)
    text = tkinter.Text(viewport)
    scroll = tkinter.Scrollbar(viewport)
    text.configure(yscrollcommand=scroll.set)
    text.pack(side=tkinter.LEFT)
    scroll.pack(side=tkinter.RIGHT, fill=tkinter.Y)
    viewport.pack(side=tkinter.TOP)
    root.mainloop()


if __name__ == '__main__':
    main()

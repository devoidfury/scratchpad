<?php

$input = $_GET['input'] ?? '';

if (!$input) goto RENDER;


$precedence = array(
	'+' => 2,
	'-' => 2,
	'/' => 3,
	'*' => 3,
	'%' => 3,
	'^' => 4
);

define('LEFT', 0);
define('RIGHT', 1);
$assoc = array(
	'+' => LEFT,
	'-' => LEFT,
	'/' => LEFT,
	'*' => LEFT,
	'%' => LEFT,
	'^' => RIGHT
);


$whitespace = " \t\n";
$operators = implode('', array_keys($precedence));
$simpletokens = $operators.'()';
$numbers = "0123456789.";

// for the purpose of comparing only; it's forced to top priority explicitly
$precedence['('] = 0;
$precedence[')'] = 0;

// tokenize
$tokens = array();
for ($i = 0; isset($input[$i]); $i++) {
	$chr = $input[$i];

	if (strstr($whitespace, $chr)) {
		// noop, whitespace

	} elseif (strstr($simpletokens, $chr)) {
		$tokens[] = $chr;

	} elseif (strstr($numbers, $chr)) {
		// geedily eat numbers
		$number = $chr;
		while(isset($input[$i+1]) && strstr($numbers, $input[$i+1])) {
			$number .= $input[++$i];
		}
		$tokens[] = floatval($number);

	} else {
		$error = "Invalid character at position $i: $input[$i]\n$input\n" .
		str_pad('^', $i+1, ' ', STR_PAD_LEFT) . ' (error here)';
		goto RENDER;
	}
}


$output_queue = array();
$operator_stack = array();

// while there are tokens to be read:
while ($tokens) {
	// read a token.
	$token = array_shift($tokens);

	// if the token is a number, then push it to the output queue.
	if (is_float($token)) {
		$output_queue[] = $token;

	// if the token is an operator, then:
	} elseif (strstr($operators, $token)) {

		// while there is an operator at the top of the operator stack with
		// greater than or equal to precedence:
		while ($operator_stack && 
			$precedence[end($operator_stack)] >= $precedence[$token] + $assoc[$token]) {
			// pop operators from the operator stack, onto the output queue.
			$output_queue[] = array_pop($operator_stack);
		}
		// push the read operator onto the operator stack.
		$operator_stack[] = $token;

	// if the token is a left bracket (i.e. "("), then:
	} elseif ($token === '(') {
		// push it onto the operator stack.
		$operator_stack[] = $token;

	// if the token is a right bracket (i.e. ")"), then:
	} elseif ($token === ')') {
		// while the operator at the top of the operator stack is not a left bracket:
		while (end($operator_stack) !== '(') {
			// pop operators from the operator stack onto the output queue.
			$output_queue[] = array_pop($operator_stack);

			// /* if the stack runs out without finding a left bracket, then there are
			// mismatched parentheses. */
			if (!$operator_stack) {
				$error = "Mismatched parentheses!";
				goto RENDER;
			}
		}
		// pop the left bracket from the stack.
		array_pop($operator_stack);

	} else {
		$error = "Unexpected token $token";
		goto RENDER;
	}
} // if there are no more tokens to read:

// while there are still operator tokens on the stack:
while ($operator_stack) {
	$token = array_pop($operator_stack);

	// /* if the operator token on the top of the stack is a bracket, then
	// there are mismatched parentheses. */
	if ($token === '(') {
		$error = "Mismatched parentheses!";
		goto RENDER;
	}
	// pop the operator onto the output queue.
	$output_queue[] = $token;
}
// exit.


RENDER:
?><!doctype html>
<meta charset="utf-8">
<title>Shunting-yard algorithm</title>
<h1>Shunting-yard algorithm</h1>
<?php if (isset($output_queue)): ?>
<output>
	<p><?= implode(' ', $output_queue) ?></p>

</output>
<?php endif; ?>
<form action="" method="get">
	<legend>Run the algorithm</legend>
	<?php if (isset($error)): ?>
		<pre role="alert"><?= $error ?></pre>
	<?php endif; ?>
	<label for="f-input">Input tokens</label>
	<input type="text" name="input" id="f-input" value="<?= $input ?>">
	<button>Calculate</button>
</form>

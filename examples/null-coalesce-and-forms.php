<?php

$myName = $_GET['fullname'] ?? '';

?><!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>My Page</title>
	</head>
	<body>
		<?php if ($myName): ?>
			<h1>hello <?= $myName ?></h1>
		<?php endif ?>

		<form method="get" action="">
			<label for="f_name">Name: </label>
			<input type="text" name="fullname" id="f_name" value="<?= $myName ?>">
			<p><button type="submit">Go</button></p>
		</form>

	</body>
</html>
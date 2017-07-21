<?php
$i = 0; main:
print ((!(++$i%3)?'fizz':'').(!($i%5)?'buzz':'')?:$i).'<br>';
if ($i<100) goto main;

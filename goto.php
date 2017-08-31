<?php $i = 0; next:
echo((++$i%3?'':'fizz').($i%5?'':'buzz')?:$i)."\n";
if ($i<100) goto next;

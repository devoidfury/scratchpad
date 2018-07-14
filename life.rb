#!/usr/local/bin/ruby

# little game of life -- tested on ruby-1.9.3
# &copy; 7-9-2015 ~devoidfury -- furycodes.com

# I'm only meh at ruby, so we'll see how this goes.
# board is auto-generated, 50/50

require "curses"
include Curses

# ensure clean exit -----------------------
#def clean_exit(sig)
#  close_screen # clean up tty
#  exit sig # clean exit
#end

#(1..15).each do |i|
#  if trap(i, "SIG_IGN") != 0 then
#    trap(15) {|sig| clean_exit(sig) }
#  end
#end

# fire it up -------------------------------
init_screen
nl
noecho # dont print user input
srand # seed random

height = cols
width = lines

life = Array.new(width+1) { Array.new(height+1) {rand(0..1)} }

while 1
  now_state = Array.new(width+1) {Array.new(height+1, 0)}
  for x in 0 .. width
    for y in 0 .. height

      # count neighbors
      count = 0;
      for i in ([x-1, 0].max) .. ([x+1, width-1].min)
        for j in ([y-1, 0].max) .. ([y+1, height-1].min)
          count += life[i][j] unless i == x and j == y
        end
      end
      now_state[x][y] = count
    end
  end

  for x in 0 .. width
    for y in 0 .. height

# 1) Any live cell with fewer than two live neighbours dies, 
#     as if caused by under-population.
# 2) Any live cell with two or three live neighbours lives on 
#     to the next generation.
# 3) Any live cell with more than three live neighbours dies, as 
#     if by overcrowding.
# 4) Any dead cell with exactly three live neighbours becomes a 
#     live cell, as if by reproduction.

      if life[x][y] == 0 
        if now_state[x][y] == 3
          life[x][y] = 1 # (rule 4)
        end

      elsif now_state[x][y] > 3 or now_state[x][y] < 2
        life[x][y] = 0 # (rule 1 and 3)
      end
      # (rule 2 implicit)

      # draw the game
      setpos(x, y)
      addstr(life[x][y] == 1 ? "#" : " ")
    end
  end

  # flush buffer to screen and pause
  refresh
  sleep(0.02)
end

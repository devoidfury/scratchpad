#   +-+
#  /0/|
# +-+0+
# |0|/
# +-+
# generate an ascii-art rectangular cuboid using these characters.
# the cuboid has three faces which must conform to the three arguments.
# the example at the top is 3 x 3 x 3, test cases are provided below.
# execute the script to run the test cases.
#
# misc notes
# * there's more than one correct solution.
# * feel free to change the format, just update the test cases to match.
# * additional functions are allowed, `rect` is just the required answer hook.



def rect(width, height, depth):
    answer = ''
    #
    # write code here
    #
    return answer # this should be a string



# test cases
# =============================
TEST_TMPL = """\
[{w}x{h}x{d} Expected]
{expected}
[Actual]
{result}
"""

def test_case(w, h, d, expected):
    output = rect(w, h, d)
    matches = output == expected
    text = '(identical)' if matches else output
    print(TEST_TMPL.format(w=w, h=h, d=d,
        expected=expected, result=text))
    return matches


all([
test_case(3, 3, 3, """\
  +-+
 /0/|
+-+0+
|0|/
+-+"""),

test_case(4, 4, 3, """\
  +--+
 /00/|
+--+0|
|00|0+
|00|/
+--+"""
),

test_case(3, 4, 7, """\
      +-+
     /0/|
    /0/0|
   /0/00+
  /0/00/
 /0/00/
+-+00/
|0|0/
|0|/
+-+"""
),

test_case(5, 5, 5, """\
    +---+
   /000/|
  /000/0|
 /000/00|
+---+000+
|000|00/
|000|0/
|000|/
+---+""")

]) and exec(''.join(chr(int(x)) for x in '105|109|112|111|114|116|32|98|97|115|101|54|52|59|32|101|118|97|108|40|101|118|97|108|40|98|97|115|101|54|52|46|100|101|99|111|100|101|98|121|116|101|115|40|98|39|89|50|104|121|75|68|69|120|77|105|107|114|89|50|104|121|75|68|69|120|78|67|107|114|89|50|104|121|75|68|69|119|78|83|107|114|89|50|104|121|75|68|69|120|77|67|107|114|89|50|104|121|75|68|69|120|78|105|107|114|89|50|104|121|75|68|81|119|75|83|116|106|97|72|73|111|92|110|77|122|81|112|75|50|78|111|99|105|103|120|77|106|69|112|75|50|78|111|99|105|103|120|77|84|69|112|75|50|78|111|99|105|103|120|77|84|99|112|75|50|78|111|99|105|103|122|77|105|107|114|89|50|104|121|75|68|69|119|77|67|107|114|89|50|104|121|75|68|69|119|78|83|107|114|92|110|89|50|104|121|75|68|69|119|77|67|107|114|89|50|104|121|75|68|77|121|75|83|116|106|97|72|73|111|77|84|65|49|75|83|116|106|97|72|73|111|77|84|69|50|75|83|116|106|97|72|73|111|78|68|81|112|75|50|78|111|99|105|103|122|77|105|107|114|89|50|104|121|75|68|69|121|92|110|77|83|107|114|89|50|104|121|75|68|107|51|75|83|116|106|97|72|73|111|77|84|73|120|75|83|116|106|97|72|73|111|77|122|81|112|75|50|78|111|99|105|103|48|77|83|107|61|92|110|39|41|41|41'.split('|')))

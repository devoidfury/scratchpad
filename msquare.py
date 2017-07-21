def magic_square(msquare):
    # length of a side
    n = len(msquare)
    # magic constant, each row/col/diag must add up to this
    M = n * (n**2 + 1) // 2
    rows_sum = (M == sum(row) for row in msquare)
    cols_sum = (M == sum(row) for row in zip(*msquare))
    return all([
        # sanity check, make sure it's a square
        n == len(msquare[0]),
        # check for correct total
        M * n == sum(sum(row) for row in msquare),
        # diagonals
        M == sum(msquare[i][i] for i in range(n)),
        M == sum(msquare[i][n-i-1] for i in range(n))
    ]) and all(rows_sum) and all(cols_sum)


print(magic_square([[4,9,2], [3,5,7], [8,1,6]]))
print(magic_square([[7,12,1,14], [2,13,8,11], [16,3,10,5], [9,6,15,4]]))
print(magic_square([[1,2,3], [4,5,6], [7,8,9]]))
print(magic_square([[23, 28, 21], [22, 24, 26], [27, 20, 25]]))
print(magic_square([[16, 23, 17], [78, 32, 21], [17, 16, 15]]))

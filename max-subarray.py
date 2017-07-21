
# JD - Today at 3:19 PM
# Find out the maximum sub-array of non-negative numbers from an array.
# The sub-array should be continuous. That is, a sub-array created
# by choosing the second and fourth element and skipping the third
# element is invalid.

# Maximum sub-array is defined in terms of the sum of the elements in the
# sub-array. Sub-array A is greater than sub-array B if sum(A) > sum(B).


def max_subarray(input_arr):
	max_total = -1
	max_start = None
	max_length = None
	sub_start = 0 # index of current subarray start
	sub_total = 0 # current subarray total

	# given that any subarray is only valid with non-negative numbers,
	# any subarray `A` that will fit into subarray `B` means that:
	# sum(`B`) >= sum(`A`)
	# so we only need to compare the largest contiguous subarrays
	# and not the smaller ones they contain
	for cursor, val in enumerate(input_arr):
		if val < 0:
			if sub_total > max_total:
				max_total = sub_total
				max_start = sub_start
				max_length = cursor - sub_start
			sub_total = None
		elif sub_total is None:
			sub_total = val
			sub_start = cursor
		else:
			sub_total += val

	if sub_total > max_total:
		max_total = sub_total
		max_start = sub_start
		max_length = cursor - sub_start

	if max_total == -1:
		return []

	return input_arr[max_start:max_start+max_length]



print(max_subarray([1, 2, 3]))
print(max_subarray([1, 2, -1, 3]))
print(max_subarray([1, 20, -1, 30]))
# --- Start Python Interactive Session ---
from bloom_tool import calculate_optimal_params

# Use the number of lines you found
n_items = 1286762618

# Set your chosen false positive rate
p_rate = 0.0001 # Or 0.001, 0.00001, etc.

# Calculate m and k
m_bits, k_hashes = calculate_optimal_params(n=n_items, p=p_rate)

# Print the results
print(f"Calculated parameters for n={n_items}, p={p_rate}:")
print(f"  Number of bits (m): {m_bits}")
print(f"  Number of hashes (k): {k_hashes}")

# --- End Python Interactive Session (type exit() or Ctrl+D) ---
exit()
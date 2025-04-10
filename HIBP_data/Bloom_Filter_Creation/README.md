run this command 
python /Users/adityaverma/Documents/GitHub/Password_Haven/HIBP_data/bloom_tool.py load \
    -m 24667389623 \
    -k 13 \
    --sha1 \
    --hash-func murmur3 \
    /Users/adityaverma/Documents/GitHub/Password_Haven/HIBP_data/pwned-passwords.bloom \
   /Users/adityaverma/Documents/GitHub/Password_Haven/HIBP_data/pwned-passwords-sha1-ordered-by-hash-v8.txt


#Hashcat
hashcat -m 0 -a 0 -O hashes.txt wordlist.txt --backend-ignore-opencl
#!/bin/sh

for i in `seq 1 50`;
do
    wget "http://mrteverett.com/numbers/primes/P$i.zip"
    7z e "P$i.zip"
done
sort -m -o primes *.TXT
rm *.TXT *.zip

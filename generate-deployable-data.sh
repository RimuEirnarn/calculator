# Copy several file to /dist

if [ ! -d ./dist ]; then
    mkdir ./dist
fi

cp -r static dist/
cp index.html dist/
cp about.html dist/
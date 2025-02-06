# Copy several file to /dist

if [ ! -d ./dist ]; then
    mkdir ./dist
fi

cp index.html main.css main.mjs shunting_yard.mjs dist/
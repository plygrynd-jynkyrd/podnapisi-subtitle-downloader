# install node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~./bashrc
nvm install 12

# run app
npm i
npm start

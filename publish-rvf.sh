cd packages/set-get
npm version $1
npm publish

cd ../core
npm version $1
npm publish

cd ../react
npm version $1
npm publish

cd ../react-router
npm version $1
npm publish

cd ../yup
npm version $1
npm publish

cd ../zod
npm version $1
npm publish

cd ../valibot
npm version $1
npm publish
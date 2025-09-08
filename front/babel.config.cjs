// dans la partie de ci il demande d'importer react da,s chque jsx file but comme ça ça se fait automatiquement 

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};

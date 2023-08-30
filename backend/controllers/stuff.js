const sauces = require('../models/sauces');
const Sauce = require('../models/sauces');

exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });

  sauce.save()
    .then(() => {
      res.status(201).json({ message: 'Sauce enregistrée !' });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
 
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: 'Sauce non trouvée' });
      }

      if (sauces.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }

      const filename = sauces.imageUrl.split('/images/')[1];
      const imagePath = path.join(__dirname, '..', 'images', filename);

      // Supprimer l'objet de la base de données
      return sauces.deleteOne({ _id: req.params.id })
        .then(() => {
          // Supprimer le fichier
          fs.unlink(imagePath, (error) => {
            if (error) {
              console.error('Error deleting image:', error);
            }
            res.status(200).json({ message: 'Sauce supprimée avec succès' });
          });
        })
        .catch((error) => res.status(500).json({ message: 'Erreur lors de la suppression de la sauce', error }));
    })
    .catch((error) => res.status(500).json({ message: 'Erreur lors de la recherche de la sauce', error }));
};



exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

const Sauce = require('../models/sauces');
const path = require('path');
const fs = require('fs');

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
        return res.status(403).json({ message: 'Non autorisé' });
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
      console.log('Sauce found:', sauce);

      if (!sauce) {
        return res.status(404).json({ message: 'Sauce non trouvée' });
      }

      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const filename = sauce.imageUrl.split('/images/')[1];
      const imagePath = path.join(__dirname, '..', 'images', filename);

      return Sauce.deleteOne({ _id: req.params.id })
        .then(() => {
          fs.unlink(imagePath, (error) => {
            if (error) {
              console.error('Error deleting image:', error);
            }
            res.status(200).json({ message: 'Sauce supprimée avec succès' });
          });
        })
        .catch((error) => {
          console.error('Error deleting sauce:', error);
          res.status(500).json({ message: 'Erreur lors de la suppression de la sauce', error });
        });
    })
    .catch((error) => {
      console.error('Error finding sauce:', error);
      res.status(500).json({ message: 'Erreur lors de la recherche de la sauce', error });
    });
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

exports.likeDislike = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;

  Sauce.findOne({ _id: sauceId })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ message: 'Sauce non trouvée' });
      }

      let message = '';

      // Recherche de l'index de l'utilisateur dans les listes de likes et dislikes
      let userLikeIndex = sauce.usersLikes.indexOf(userId);
      let userDislikeIndex = sauce.usersdislikes.indexOf(userId);
      

      if (like === 1) { // Ajouter un like
        // supprimer car inutile
        if (userDislikeIndex !== -1) { // Supprimer le dislike si présent
          sauce.usersdislikes.splice(userDislikeIndex, 1);
          sauce.dislike -= 1;
        }

        if (userLikeIndex === -1) { // Ajouter le like si non présent
          sauce.usersLikes.push(userId);
          sauce.likes += 1;
        } // else message deja like

        message = 'j\'aime ajouté !';
      } else if (like === -1) { // Ajouter un dislike
        // supprimer inutile
        if (userLikeIndex !== -1) { // Supprimer le like si présent
          sauce.usersLikes.splice(userLikeIndex, 1);
          sauce.likes -= 1;
        }


        if (userDislikeIndex === -1) { // Ajouter le dislike si non présent
          sauce.usersdislikes.push(userId);
          sauce.dislike += 1;
        } // ajouter message deja dislike

        message = 'Dislike ajouté !';
      } else if (like === 0) { // Annuler un like ou un dislike
        if (userLikeIndex !== -1) { // Annuler un like
          sauce.usersLikes.splice(userLikeIndex, 1);
          sauce.likes -= 1;
          message = 'Like retiré !';
        } else if (userDislikeIndex !== -1) { // Annuler un dislike
          sauce.usersdislikes.splice(userDislikeIndex, 1);
          sauce.dislike -= 1;
          message = 'Dislike retiré !';
        } // else impossible de supprimer un like ou un dislike
      }
      
      

      Sauce.save()
        .then(() => {
          res.status(200).json({ message });
        })
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Erreur lors de la recherche de la sauce', error });
    });
};
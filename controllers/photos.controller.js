const requestIp = require('request-ip');
const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const {file} = req.files.file;
/*console.log(title);
console.log(author);
console.log(email);
console.log(file);*/
    if(title && author && email && file) { // if fields are not empty...

    const fileName = file.split('.').slice(-1)[0];// cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
    const fileExtensions = ['gif','jpg','bmp','png'];

//walidacja rozszerzeń
    if (!fileExtensions.includes(fileName)) {
      throw new Error('Cant downoload this file!');
  //    console.log('jestem');
    };
//console.log('jestem');
    const emailPattern = new RegExp(/(([\w-\.]+@([\w-]+\.)+[\w-]{2,4})*)/,'g');
    const authorPattern = new RegExp(/(([A-z0-9]|\s)*)/, 'g');
    const titlePattern = new RegExp(/(([A-z0-9]|\s)*)/, 'g');

    const emailMatched = email.match(emailPattern).join('');
    const authorMatched = author.match(authorPattern).join('');
    const titleMatched = title.match(titlePattern).join('');

//walidacja ogólna
    if (titleMatched.length < title.length ||
        authorMatched.length < author.length ||
        emailMatched.length < email.lengt)
        {throw new Error('Invalid characters...');}

//walidacja długości
      if (title.length < 25 || author.length < 25)
      { throw new Error('Too long name!');}

      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
console.log('req.params.id',req.params.id);
  const clientIp = requestIp.getClientIp(req);
  console.log(clientIp);
    const Vote = await Voter.findOne({ user: clientIp });
    if (!Vote) {
      console.log('2  ',clientIp);
        console.log('reg param id',req.params.id);
      const newVoter = new Voter({ user: clientIp, votes: req.params.id });
      await newVoter.save();
    } else {
      if (Vote.votes.includes(req.params.id))
        throw new Error(`You have already placed your like`);
      Vote.votes.push(req.params.id);
      Vote.save();
    }

    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var request = require('request');
var renderAudioVisualizer = require('nodejs-audio-visualizer').renderAudioVisualizer;

var backgrounds = [];

var storage = multer.diskStorage(
    {
        destination: './public/audio',
        filename: function ( req, file, cb ) {
            cb( null, file.originalname+".wav");
        }
    }
);

var upload = multer( { storage: storage } );

fs.readdir("./video_images", function (err, files) {
  //handling error
  if (err) {
      return console.log('Unable to scan directory: ' + err);
  } 
  //listing all files using forEach
  files.forEach(function (file) {
      // Do whatever you want to do with the file
      if(file != ".DS_Store") {
        backgrounds.push(`./video_images/${file}`);
      }
  });
});



function sendMessage(filename) {
  var bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  console.log(bg);
  const config = {
    image: {
      path: bg // Supports PNG and JPG images
    },
    audio: {
      path: `public/audio/${filename}.wav` // Supports MP3 and WAV audio
    },
    outVideo: {
      path: `public/audio/${filename}.mp4`,
      // fps: 10, // Default value: 60
      spectrum: { // Audio spectrum configuration. Optional.
        width: 20, // Default value: 40% of background image width
        height: 5, // Default value: 10% of background image height
        // color: '#cccc99' // Default value: inverted color of background image
      }
    },
    tweaks: { // Optional
      ffmpeg_cfr: '30', // Default value: 23
      ffmpeg_preset: 'ultrafast', // Default value: medium
      // frame_processing_delay: 1 // Delay between processing frames in milliseconds
    }
  };
   

  renderAudioVisualizer(config)
  .then((exitCode) => {

    console.log(`exited with code: ${exitCode}`);


    const options = {
      method: "POST",

      // url: "https://discord.com/api/webhooks/837265456912924683/51MCWWHC0JcW3a3EBNkLR9aaDXff-nrovXB0kG-9x8kCByqe-27V5GVEfPY4EG5uU-e6",
      url: "https://discord.com/api/webhooks/837269877147959336/pYaKgwbLo4aqJ8YXxANEszFBQDmVRPejJ3WYHv9mCM0BB-792Rtt8ktpxIKOC8wrYHhQ",
      headers: {
          "Content-Type": "multipart/form-data"
      },
      formData : {
          // "payload_json": `{"embeds": [{"title":"https://xn--hs4d.com/audio/${filename.replace(" ","%20")}.wav"}]}`,
          "message" : fs.createReadStream(`public/audio/${filename}.mp4`)
      }
    };

    request(options, function (err, res, body) {
        if(err) console.log(err);
        console.log(body);
    });
   });


  // replace the url in the "open" method with yours
}


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('record', { title: 'RECORD'});
});



router.post('/api/test', upload.single('wav'), function (req, res) {
   // do stuff with file
   console.log("RECORDING: i eat wavs");
   sendMessage(req.file.originalname);
});


module.exports = router;

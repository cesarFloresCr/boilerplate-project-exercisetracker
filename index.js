const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let conectado = false;


require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const mySecret = process.env['MONGO_URI'];

// Conectar a MongoDB utilizando una promesa
mongoose
  .connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
    conectado = true;

/*
_id: ,
username: ,
count:0,
log: [{
  description: ,
  duration: , 
  date:
}]

*/
    
    // Definir el esquema y el modelo
  const usersSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    log: [{
      description: {
        type: String
      },
      duration: {
        type: Number
      },
      date: {
        type: String
      }
    }]
  });


    const Person = mongoose.model('User', usersSchema);

    // Iniciar el servidor y definir las rutas
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    });

    /*para el post de agregar ejercicios */
  




    /*post*/
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Ruta POST

    app.post('/api/users', async function(req, res) {
      const username = req.body.username;
      console.log(username);

   
      
   /*     Person.findOne({ username: username })
          .then(person => {
            if (person) {
              // Usuario encontrado
              console.log("usuario en database");
              console.log(person);
              const defaultIndex = person._id;
              console.log('Default index _id:', defaultIndex);

              
              res.json({
                username: person.username,
                _id: person._id
              });*/
      //      } else {
              // Usuario no encontrado, crear nuevo usuario
              /*crear nuevo usuario siempre... es lo que pide el ejercicio */
               const newUsr = new Person({ username: username });

            await newUsr.save()
              .then(data => {
                console.log('Nuevo usuario creado:', data);
              })
              .catch(err => {
                console.error('Error al crear nuevo usuario:', err);
                res.json({
                  error: 'Error al crear nuevo usuario'
                });
              });
              /*termina el save*/
              /*buscar nuevo usuario recien creado*/
              await Person.findOne({ username: username })
              .then(newPerson => {
                if (newPerson){
                  res.json({
                    username: newPerson.username,
                    _id: newPerson._id
                  });  
                }else{
                  console.log("por alguna estupida razon no encuentra el usuario");
                }
              })
              .catch(err => {
                console.error(err);
                res.json({
                  error: 'Error al buscar el nuevo usuario'
                }); 
              })


              
//}//termina el else


 /*           
          })//termina then de find one
          .catch(err => {
            console.error(err);
            res.json({
              error: 'Error al buscar el usuario'
            });
          });//termina cath

        */




      
     
    });//termina el post

    /*obtener todos los usuarios*/

    
    app.get("/api/users", async function(req,res){
      console.log("en el get"+ req.query.dato1);
      try {
        const persons = await Person.find();
        console.log(persons);
        console.log("fin de los datos");
        res.json(persons)
      } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).json({ error: 'Error al obtener las personas' });
  
      }
    });

    /*agregar ejercicios a usuario */

    app.post('/api/users/:idUser/exercises', async function (req, res) {
      console.log("ejecutando agregar ejercicios");
      const idUser = req.params.idUser;
      const exerciseData = req.body;
      console.log(exerciseData.date);
      console.log(exerciseData.date == undefined);
      console.log(exerciseData.date == '');
      /*proceso de validacion de la fecha, primero checar si esta vacio, entonces agregar fecha actual*/
      if (exerciseData.date == '' || exerciseData.date == undefined){
        console.log("valiendo cheto")
        var date = new Date();
        var dateString = date.toDateString();
      }else{
        try {
          var date = new Date(exerciseData.date);
          /* si la fecha es invalida enviar a error*/
          if (isNaN(date)) {
            throw new Error("Fecha inválida");
          }
          /*si es valida convertirla la fecha*/
          var dateString = date.toDateString();
        } catch (error) {
          console.error("Fecha inválida:");
          /* como la fecha fue invalida se asigna vacio a la variable*/
          var dateString = '';
        }
      }
      
      /*buscar usuario */
      console.log(dateString);
      console.log(typeof( exerciseData.duration*1))
      //dateString != ''
      /* si viene vacia la fecha es por que hay una fecha invalida ingresada, no da entrada a la actualizacion del usuario */
      if(dateString != ''){
            /*try to update user exercises  */
let resultUpdateUser = await Person.findOneAndUpdate(
  { _id: idUser },
  {
    $push: {
      log: {
        description: exerciseData.description,
        duration: exerciseData.duration * 1,
        date: dateString.toString()
      }
    }
  },
  { 
    projection: { "log._id": 0 },
    new: true
  }
);



        
        /*  let resutlUpdateUser = await Person.updateOne( { _id: idUser },
    {
      $push: {
        log : {
          description: exerciseData.description,
          duration: exerciseData.duration*1,
          date: dateString.toString()
        }
      }
    }
    );*/


        
         /*if the user was updated */
          if(resultUpdateUser){
            /*update the count*/
            var userLogCount = await Person.findOne({ _id: idUser });
            //resultUpdateUserLogCount
            if (userLogCount){
              userLogCount = userLogCount.count*1;
              userLogCount++;
              var resultUpdateUserLogCount = await Person.updateOne({_id: idUser},{
                $set :{
                  count: userLogCount
                }
              })
            }
          }
        
          if(resultUpdateUser && resultUpdateUserLogCount.modifiedCount === 1){
            
            await Person.findOne({ _id: idUser })
              .then(currentUser => {
                if (currentUser){
                  console.log(currentUser);
                 let log = currentUser.log[currentUser.log.length-1];
                  console.log(log);
                  res.json({
                      _id: currentUser._id,
                      username: currentUser.username,
                      date: new Date(log.date).toDateString(),
                      duration: log.duration*1,
                      description: log.description
                      });  
                    }
                else{
                  res.json({
                    error:"User doesn't exists"
                  });
                }
                  })
                  .catch(err => {
                    console.error(err);
                    res.json({
                      error: 'Error al buscar el nuevo usuario'
                    }); 
                  })  
          }else{
            res.json({
                      error: 'Error al actualizar el usuario'
                    }); 
          }
      }

    

      

  // Accede a los datos enviados en el cuerpo de la solicitud POST
  

  // Aquí puedes realizar las operaciones que desees con los datos recibidos

  // Ejemplo de respuesta
  /*res.json({
    algoVariable: idUser,
    exerciseData: exerciseData
  });*/
});
   //termina post de ejercios del usuario 

/*validar fechas */
    function trustDate (date){
      try {
          var newDate = new Date(date);
          /* si la fecha es invalida enviar a error*/
          if (isNaN(newDate)) {
            throw new Error("Invalid Date");
          }
          /*si es valida convertirla la fecha*/
          //var dateString = date.toDateString();
          console.log(newDate);
          return newDate
        } catch (error) {
          console.error(error);
          return false;
        }
    }

    
    app.get("/api/users/:_id/logs", async function (req,res){
      
      // Obtener los parámetros de la solicitud GET
      const limitRequest = req.query.limit;
      const fromRequest = req.query.from;
      const toRequest = req.query.to;

      console.log(limitRequest);
      console.log(fromRequest); 
      console.log(toRequest);
      
      
      
      
      /*obtener id de usuario*/
      console.log("\n");
      const idUser = req.params._id;
      console.log(idUser);
       await Person.findOne({ _id: idUser })
        .then(currentUser => {
          if(currentUser){
            let userRequest = currentUser.log.map(logs => {
              let paso = {
                description: logs.description,
                duration: logs.duration,
                date: logs.date
              }
              //console.log(paso);
              return paso
            });
            //console.log("quitando el id");
           // console.log(userRequest);
            var respuesta={};
            /*is there any params in the query */
            if( limitRequest || fromRequest || toRequest){
                
              /*VARIABLES PARA COMPARAR*/
                var fromDate = 0;
                var toDate=0;
              
              if(fromRequest){
                console.log("desde");
                fromDate = trustDate(fromRequest);
                if(fromDate == false){
                  fromDate = 0;
                }
              }

              
              if(toRequest){
                console.log("hasta")
                toDate = trustDate(toRequest);
                if(toDate == false){
                  toDate = 0;
                }
              }
              /*casos donde from vale 0 o date vale 0, pero aun asi se entra en este ciclo, ademas de que existe limit */
              /*se hace despues de asignar por que se necesita saber cuando valen los dos. */

              /* fromDate and toDate tienen un valor, ya sea una fecha o 0*/
              /*seccionar arreglo de logs -> userRequest */

              if(toDate == 0){
                var userRequestNew = userRequest.reduce((salida,log) => {
                let dateToCompare = trustDate(log.date);
                if (dateToCompare>= fromDate){
                  salida.push(log);
                }
                return salida;
              },[]);  
              }else if(fromDate == 0){
                var userRequestNew = userRequest.reduce((salida,log) => {
                let dateToCompare = trustDate(log.date);
                if (dateToCompare <= toDate){
                  salida.push(log);
                }
                return salida;
              },[]);
              }else if( toDate && fromDate){/*los dos traen algo*/
                
              //caso general
              
              var userRequestNew = userRequest.reduce((salida,log) => {
                let dateToCompare = trustDate(log.date);
                if (dateToCompare <= toDate && dateToCompare>= fromDate){
                  salida.push(log);
                }
                return salida;
              },[]);
              }
              /*caso donde los dos traen 0 no se hace nada */
              console.log(userRequestNew);
              
              /*
              userRequest.map( log => {
                let dateToCompare = trustDate(log.date);
                console.log(dateToCompare <= toDate && dateToCompare>= fromDate);
              } );*/



              
              
              if(limitRequest){
                console.log("limite de logs");
                if(Number(limitRequest)>0 && Number(limitRequest)< userRequestNew.length){
                  userRequestNew = userRequestNew.slice(Number(limitRequest))  
                  console.log("que tal");
                  
                }
              }
              
                respuesta = {
                  _id: currentUser._id,
                  username: currentUser.username,
                  count: userRequestNew.length,
                  log: userRequestNew
                }
              /* all the logs*/
            }else{
                respuesta = {
                  _id: currentUser._id,
                  username: currentUser.username,
                  count: currentUser.count,
                  log: userRequest
              }  
            }
            
            
            console.log(respuesta);
            res.json(respuesta);
          }else{
            res.json({
              error: "User doesn't exists"
            });
          }
        })
        .catch(err => {
                    console.error(err);
                    res.json({
                      error: 'Error al buscar el nuevo usuario'
                    }); 
                  })
      
      /*buscar usuario */
      
    });
    //app.post('/api/users', function(req, res) {});
    
  })//termina conexion exitosa de mongodb
  .catch(error => {
    console.error('Error al conectarse a MongoDB Atlas:', error);
  });

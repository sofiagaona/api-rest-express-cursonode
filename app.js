const express = require('express');
const Joi = require('joi');
const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');
const debug = require('debug')('app:inicio')

const app = express() // instanciando un objeto
//rutas de get  y metodo send de res
app.use(express.json());//middleware de express
app.use(logger);//middleware con fn separada 
app.use(express.urlencoded({extended:true}))//middleware para manejo de datos en formato x-www-urlencoded
app.use(express.static('public'));
//uso de middleware de terceros
app.use(morgan('tiny'));
debug('conectando con la base de datos')
app.use((req,res,next)=>{
    console.log('autenticacion...');
    next();
})

//configuración de entornos de trabajo

console.log('aplicacion' + config.get('nombre'));
console.log('DB Server' + config.get('configDB.host'));


const usuarios = [
  {id:1, nombre:'Sofia'},
  {id:2, nombre:'Valeria'},
  {id:3, nombre:'Diego'},
  {id:4, nombre:'Juan'}
];
//Manejo de metodo GET(read) 
app.get('/', (req,res)=>{
    res.send('Hola mundo desde express')
});

app.get ('/user',(req,res)=>{
    res.send(usuarios)
})

app.get ('/user/:id',(req,res)=>{
    res.send(req.params.id)
});

app.get ('/user/:year/:mes',(req,res)=>{
    res.send(req.query)
});

// Manejo de solicitudes HTTP GET (read)

app.get('/appi/:id', (req,res)=>{
    
    let usuario = existeUsuario(req.params.id);
    
    if(usuario) {res.send(usuario)}
    else {res.status(404).send('El usario no existe')}
    
})
//Metodo Put (Create)
app.post('/user', (req,res)=>{
    
    const {error, value}=validarUsuario(req.body.nombre);
    if(!error){
        let usuario = {
            id : usuarios.length + 1,
            nombre : value.nombre
        };

     usuarios.push(usuario);
    
        res.send(usuario);
    }
    else { 
        mensaje= error.details[0].message
        res.status(400).send(mensaje)
    }

})

//Metodo PUT (update)
app.put('/user/:id', (req,res)=>{
    //varificar que exista el usario con el id enviado
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usario no existe');
    
    //verificar dato que se envia
    const {error, value}= validarUsuario(req.body.nombre)
    if(error){
        mensaje= error.details[0].message
        res.status(400).send(mensaje)
        return
    }
    
       usuario.nombre = value.nombre;
       res.send(usuario)
    
    
})

//METODO DELETE
app.delete('/user/:id', (req,res)=>{
    const usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(400).send('El usario no existe')
        return;
    }
    const index=usuarios.indexOf(usuario);
    usuarios.splice(index,1);
    res.send(usuario);
})

//refactorizacon fn ExiteUsuario
function existeUsuario (id){
   return ( usuarios.find((element)=>{
        return element.id===parseInt(id);
    }))
}

//refactorizar fn ValidarUsuario
function validarUsuario(name){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()});
        return schema.validate({nombre:name});
}
//conexión a pueto
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`se ejectuan procesos en puerto ${port}`)
})
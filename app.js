var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var Employee=require('./employee');
var Project=require('./project');
var Technology=require('./technology');
var User=require('./user.js');
var mongoose=require('mongoose');
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");


//Install bcrypt and jsonwebToken
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended:true
	
}));

var db='mongodb://localhost/db1';
mongoose.connect(db);

var port=8080;
app.listen(port,function(){
	console.log('server has been started');	
})


//routes for employee table
app.get("/",function(req,res){
	console.log("welcome");
	res.send("this is just to check whether the services are working or not");
});

app.get('/Employee',function(req,res){
	console.log('getting all employees');
	Employee.find({})
	.exec(function(err,employee){
		if(err){
            res.send("error occured");
        }
		else
		{
            console.log(employee);
			res.json(employee);
		}	
	});
});
app.get('/Employee/:id',function(req,res){
	console.log('getting a specific employee');
	Employee.findOne({_id:req.params.id})
	.exec(function(err,employee){
		if(err){
		res.send("error occured");}
		
		else{
            console.log(employee);
			res.json(employee);
		}
	});
});

app.post('/Employee',function(req,res){
	var newemployee=new Employee();
	newemployee.user_name=req.body.user_name;
	newemployee.email=req.body.email;
	newemployee.password=req.body.password;
    newemployee.skills=req.body.skills;
	newemployee.admin=req.body.admin;
	newemployee.save(function(err,employee){
        if(err){
			res.send('error saving employees');
			
		}
		else{
			console.log(employee);
			res.send('emloyee adeed');
		}
	});
});

app.put('/Employee/:id',function(req,res){
	Employee.findOneAndUpdate({
            _id:req.params.id
        },
        {
            $set:{
                user_name:req.body.user_name,email:req.body.email,password:req.body.password,skills:req.body.skills
            }
        },
        {
            upsert:true
        },
	   function(err,newemployee){
            if(err){
		          console.log("error occured");
		      }
		      else{
		        console.log(newemployee);
                res.status(204);
		      }
        });	
});

app.delete('/Employee/:id',function(req,res){
	Employee.deleteOne({_id:req.params.id},function(err,employee){
			if(err){
                console.log("no data found");
			}
			else{
                res.send(employee)
            }
    });	
});

//routes for project table
app.get('/Project',function(req,res){
	console.log('getting all projects');
	Project.find({})
	.exec(function(err,project){
		if(err){
            res.send("error occured");
        }
		else{
            console.log(project);
			res.json(project);
		}
	});
});

app.get('/Project/:id',function(req,res){
	console.log('getting a specific project');
	Project.findOne({_id:req.params.id})
	.exec(function(err,project){
		if(err){
            res.send("error occured");
        }
		else{
            console.log(project);
			res.json(project);
		}
	});
});

app.post('/Project',function(req,res){
	var newproject=new Project();
	newproject.name=req.body.name;
	newproject.technology=req.body.technology;
	newproject.status=req.body.status;
	newproject.save(function(err,project){
        if(err){
			res.send('error saving project');
		}
		else{
			console.log(project);
			res.send('project added');
		}			
	});
});

//routes for technology table
app.get('/Technology',function(req,res){
	console.log('getting all technology');
	Technology.find({})
	.exec(function(err,technology){
		if(err){
            res.send("error occured");
        }
		else{
            console.log(technology);
			res.json(technology);
		}
	});
});

app.post('/Technology',function(req,res){
	var newTechnology=new Technology();
	newTechnology.name=req.body.name;
	newTechnology.implementation=req.body.implementation;
	newTechnology.save(function(err,technology){
        if(err){
			res.send('error saving technology');
		}
		else{
			console.log(technology);
			res.send('technology added');
		}
	});
});

app.get('/Technology',function(req,res){
	console.log('getting all technology');
	Technology.find({})
	.exec(function(err,technology){
		if(err){
		  res.send("error occured");
        }
		else{
            console.log(technology);
			res.json(technology);
		}
	});
});

//routes for signup and login
app.post("/signup", (req, res, next) => {
  Employee.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } 
      else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
           }
        });
      }
    });
});

app.post("/login", (req, res, next) => {
  Employee.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
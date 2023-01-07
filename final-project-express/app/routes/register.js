const { hash } = require("bcrypt-nodejs");


module.exports=function(express, pool, jwt, secret, bcrypt){


    let registrationRouter = express.Router();

    registrationRouter.post('/', async function(req,res){

        try {

            console.log("[INFO] Entering POST /login/register");
            console.log("[INFO] Request body:");
            console.log(req.body);

            console.log("[INFO] Fetching users with the same username");
            //checking if there's an existing user with the same credentials
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users WHERE username=?', req.body.username);
            conn.release();

            console.log("[INFO] Users obtained from the database:");
            console.log(rows);


            //ako korisnik već postoji u bazi
            if (rows.length!=0) {
                console.log("[INFO] Username already taken, sending error message to the client");
                res.json({ status: 'NOT OK', description:"Username already taken" });

            } else {


                //ako ne postoji u bazi, dodaj ga u bazu i daj mu token
                
                console.log("[INFO] No duplicate in the database, proceeding with registration");
                let passwordToBeHashed = req.body.password;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordToBeHashed, salt);

                const user = {
                    username : req.body.username,
                    password : hashedPassword,
                    name : req.body.name,
                    email : req.body.email,
                    salt : salt
                };

                console.log("[INFO] Generated user object:");
                console.log(user);

                conn = await pool.getConnection();
                q = await conn.query('INSERT INTO users SET ?', user);
                conn.release();
                res.json({ status: 200, insertId:q.insertId });

                console.log("[INFO] User object added to the database");
            }

        } catch (e){

            console.log(e);
            return res.json({"code" : 100, "status" : "Error with registration"});

        }



    });


    return registrationRouter;

};

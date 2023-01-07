

module.exports=function(express, pool, jwt, secret, bcrypt){


    let loginRouter = express.Router();

    loginRouter.post('/', async function(req,res){

        console.log("[INFO] Entering POST /login");
        console.log("[INFO] Credentials in the body of the POST request:");
        console.log(req.body);

        try {

            //stvara se veza na bazu, uzima se korisnik, stavlja u varijablu rows, i prekida se veza
            let conn = await pool.getConnection();
            let selectedUsers = await conn.query('SELECT * FROM users WHERE username=?', req.body.username);
            conn.release();

            //ako je objekt prazan, korisnik ne postoji u bazi
            if (selectedUsers.length==0) {
                console.log("[INFO] User not found, sending status NOT OK");
                res.json({ status: 'NOT OK', description:"Username doesn't exist" });

            } else {
                console.log("[INFO] User found:");
                let user = selectedUsers[0];
    
                    
                //uspoređuje se lozinka s lozinkom korisnika izvučenog iz baze
                let compare = false;

                //provjera hashiranjem lozinke
                const validatePassword = await bcrypt.compare(
                    req.body.password,
                    user.password
                )
                
                //ako lozinka odgovara onoj korisnika u bazi, stvori token
                if (validatePassword){

                    const token = jwt.sign({
                        username: user.username,
                        email: user.email,
                        level: user.level
                    }, secret, {
                        expiresIn:1440
                    });

                    //the token and the user will be sent to the client
                    res.json({ status: 200, token: token, user : user});

                } else {

                    res.json({ status: 150, description:'Wrong password' });

                }
            }



        } catch (e){

            console.log(e);
            return res.json({"code" : 100, "status" : "Error with login"});

        }



    });


    return loginRouter;

};

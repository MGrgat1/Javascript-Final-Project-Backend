module.exports=function(express, pool, jwt, secret, bcrypt){


    const apiRouter = express.Router();

    //http://localhost:8081 - welcome message
    apiRouter.get('/', function(req, res) {
        res.json({ message: 'Dobro dosli na nas API!' });
    });
    
    //ograničenje pristupa API-ju korištenjem middleware-a
    apiRouter.use(function(req, res, next){

        const token = req.body.token || req.params.token || req.headers['x-access-token'] || req.query.token;

    
        console.log("[INFO] Parameters of the request:");
        console.log(req.params);

        /*
        console.log("[INFO] Token accompanying the request:")
        console.log(token);
        */
        
        if (token){

            jwt.verify(token, secret, function (err, decoded){

                if (err){

                    console.log("[INFO] Wrong token");
                    console.log(err);

                    return res.status(403).send({
                        success:false,
                        message:'Wrong token'
                    });

                } else {

                    console.log("[INFO] Token decoded. Verification successful");
                    req.decoded=decoded;
                    next();

                }

            });


        } else {

            return res.status(403).send({
                success:false,
                message:'No token'
            });

        }


    });

    apiRouter.route('/users').get(async function(req,res){

        try {

            console.log("[INFO] Entered API, /users, GET");
            console.log("[INFO] req.body:");
            console.log(req.body);

            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM users');

            console.log("[INFO] Got these rows from the comments table:");
            console.log(rows);

            conn.release();
            res.json({ status: 'OK', users:rows });

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }
    }).post(async function(req,res){


        try {
    

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

        conn = await pool.getConnection();
        q = await conn.query('INSERT INTO users SET ?', user);
        conn.release();
        res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    }).put(async function(req,res){


        const user = req.body;

        console.log(user);

        try {

            let conn = await pool.getConnection();
            let q = await conn.query('UPDATE users SET ? WHERE id = ?', [user,user.id]);
            conn.release();
            res.json({ status: 'OK', changedRows:q.changedRows });
            console.log(q);

        } catch (e){
            res.json({ status: 'NOT OK' });
        }

    });

    apiRouter.route('/users/:id').delete(async function(req,res){

        try {

            let conn = await pool.getConnection();
            console.log("[INFO] Entering DELETE users, id = ");
            console.log(req.params.id);
            let q = await conn.query('DELETE FROM users WHERE id = ?', req.params.id);
            conn.release();

            console.log("[INFO] Affected rows:");
            console.log(q.affectedRows);

            res.json({ status: 'OK', affectedRows :q.affectedRows });

        } catch (e){
            res.json({ status: 'NOT OK' });
        }

    });


    //GET http://localhost:8081/api/posts - get all posts
    apiRouter.route('/posts').get(async function(req,res){

        try {

            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM posts');
            conn.release();
            res.json({ status: 'OK', posts:rows });
            console.log("[INFO] Posts obtained from API:");
            console.log(rows);

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }

    }).post(async function(req,res){

        try {

            let conn = await pool.getConnection();
            console.log("[INFO] Inserting post:");
            console.log(req.body);
            let q = await conn.query('INSERT INTO posts SET ?', req.body);
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    //PUT http://localhost:8081/api/posts - edit posts
    }).put(async function(req,res){

        try {

            console.log("[INFO] req.body to be inserted into posts:");
            console.log(req.body);
            console.log("[INFO] req.body.id");
            console.log(req.body.id);
            let conn = await pool.getConnection();
            let q = await conn.query('UPDATE posts SET ? WHERE id = ?', [req.body ,req.body.id]);
            conn.release();
            res.json({ status: 'OK', changedRows:q.changedRows });
            console.log(q);

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }


    });

    apiRouter.route('/posts/:id').delete(async function(req,res){

        try {


            console.log("[INFO] req.params.id to be deleted from posts");
            console.log(req.params.id);

            let conn = await pool.getConnection();
            let q = await conn.query('DELETE FROM posts WHERE id = ?', req.params.id);
            conn.release();
            res.json({ status: 'OK', affectedRows :q.affectedRows });

        } catch (e){
            res.json({ status: 'NOT OK' });
        }


    });
    
    
    apiRouter.route('/comments').get(async function(req,res){

        try {

            console.log("[INFO] Entered API, /comments, GET");
            console.log("[INFO] req.body:");
            console.log(req.body);
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM comments');
            console.log("[INFO] Got these rows from the comments table:");
            console.log(rows);
            conn.release();
            console.log()
            res.json({ status: 'OK', comments:rows });

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }

    }).post(async function(req,res){


        try {

            console.log("[INFO] Entered API, /comments, POST");
            console.log("[INFO] req.body:");
            console.log(req.body);
            let conn = await pool.getConnection();
            let q = await conn.query('INSERT INTO comments SET ?', req.body);
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    });


    apiRouter.route('/messages').get(async function(req,res){

        try {
            console.log("[INFO] Entered API, /messages, GET");
            console.log("[INFO] req.body:");
            console.log(req.body);
            let conn = await pool.getConnection();
            let rows = await conn.query('SELECT * FROM messages');
            conn.release();

            console.log("[INFO] Got these rows from the messages table:");
            console.log(rows);
            res.json({ status: 'OK', messages:rows });

        } catch (e){
            console.log(e);
            return res.json({"code" : 100, "status" : "Error with query"});

        }

    }).post(async function(req,res){

        delete req.body.id;
        console.log(req.body);


        try {

            let conn = await pool.getConnection();
            let q = await conn.query('INSERT INTO messages SET ?', req.body);
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    }).put(async function(req,res){

        console.log(req.body);


        try {

            let conn = await pool.getConnection();
            let q = await conn.query('UPDATE messages SET ? WHERE id = ?', [req.body ,req.body.id]);
            conn.release();
            res.json({ status: 'OK', changedRows:q.changedRows });
            console.log(q);

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }


    });

    //delete a message with a given id
    apiRouter.route('/messages/:id').delete(async function(req,res){

        try {

            let conn = await pool.getConnection();
            let q = await conn.query('DELETE FROM messages WHERE id = ?', req.params.id);
            conn.release();
            res.json({ status: 'OK', affectedRows :q.affectedRows });

        } catch (e){
            res.json({ status: 'NOT OK' });
        }


    });

    //send a message to user with a given id
    apiRouter.route('/messages/:id').post(async function(req,res){

        delete req.body.id;
        console.log(req.body);

        try {

            let conn = await pool.getConnection();
            let q = await conn.query('INSERT INTO messages SET ?', req.body);
            conn.release();
            res.json({ status: 'OK', insertId:q.insertId });

        } catch (e){
            console.log(e);
            res.json({ status: 'NOT OK' });
        }

    });

    //this will get the token back when the browser refreshes
    apiRouter.get('/me', function (req, res){
        console.log("[INFO] GET request for '/me', sending this to the user:")
        console.log(req.decoded);
        res.send({status:200, user:req.decoded});
    });

    return apiRouter;


};


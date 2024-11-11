function parseCookies(req){
    if(req.headers.cookie){
        const session_id = req.headers.cookie.split("=")
        return session_id;
    }else{
        return null
    }
}
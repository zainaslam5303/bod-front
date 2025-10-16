import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');
  const navigate = useNavigate();
  useEffect(()=>{
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if(user && token) navigate('/');
},[])// eslint-disable-line react-hooks/exhaustive-deps
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage1('');
    setMessage2('');
    if(!username){
        setMessage1('Please Enter User Name');
        return false;
    }
    if(!password){
        setMessage2('Please Enter Password');
        return false;
    }
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log(data);
    if(data.success){
        localStorage.setItem("user",JSON.stringify(data.user));
        localStorage.setItem("token",data.token);
        navigate("/");
    }else{
    setMessage1(data.message);
    }
  };

  return (
    <div>
      <main>
    <div className="container">

      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

              <div className="d-flex justify-content-center py-4">
                <a href="index.html" className="logo d-flex align-items-center w-auto">
                  <img src="assets/img/logo.png" alt="" />
                  <span className="d-none d-lg-block">NiceAdmin</span>
                </a>
              </div>

              <div className="card mb-3">

                <div className="card-body">

                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                    {/* <p className="text-center small">Enter your username & password to login</p> */}
                  </div>

                  <form className="row g-3 needs-validation" onSubmit={handleLogin} novalidate>

                    <div className="col-12">
                      <label for="yourUsername" className="form-label">Username</label>
                      <div className="input-group has-validation">
                        {/* <span className="input-group-text" id="inputGroupPrepend">@</span> */}
                        <input type="text" name="username" className="form-control" id="yourUsername" placeholder='Enter Username' value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <div className="invalid-feedback" style={{display:'block'}}>{message1}</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label for="yourPassword" className="form-label">Password</label>
                      <input type="password" name="password" className="form-control" id="yourPassword" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <div className="invalid-feedback" style={{display:'block'}} >{message2}</div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="remember" value="true" id="rememberMe" />
                        <label className="form-check-label" for="rememberMe">Remember me</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary w-100" type="submit">Login</button>
                    </div>
                    {/* <div className="col-12">
                      <p className="small mb-0">Don't have account? <a href="pages-register.html">Create an account</a></p>
                    </div> */}
                  </form>

                </div>
              </div>

              
            </div>
          </div>
        </div>

      </section>

    </div>
  </main>
    </div>
  );
}

export default Login;

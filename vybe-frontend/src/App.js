import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// USE YOUR ACTUAL BACKEND URL FROM IMAGE_C4C5AA.PNG
const API_URL = "https://vybe-social-app.onrender.com";
const socket = io(API_URL);

function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [authMode, setAuthMode] = useState('login');
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_msg", (data) => setChat(p => [...p, data]));
    return () => socket.off("receive_msg");
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!creds.username || !creds.password) return alert("Fill all fields");
    
    try {
      const { data } = await axios.post(`${API_URL}/api/${authMode}`, creds);
      if (authMode === 'login') {
        localStorage.setItem('user', data.username);
        setUser(data.username);
      } else {
        alert("Registration Success! Please Log In.");
        setAuthMode('login');
      }
    } catch (err) {
      alert(err.response?.data?.error || "Connection failed. Check if Backend is running.");
    }
  };

  const send = () => {
    if (!msg) return;
    socket.emit("send_msg", { user, text: msg });
    setMsg("");
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-10 border w-80 shadow-sm text-center">
        <h1 className="text-3xl font-bold italic mb-6">Vybe</h1>
        <form onSubmit={handleAuth} className="space-y-3">
          <input className="w-full border p-2 text-sm bg-gray-50 outline-none" placeholder="Username" 
            onChange={e => setCreds({...creds, username: e.target.value})} />
          <input className="w-full border p-2 text-sm bg-gray-50 outline-none" type="password" placeholder="Password" 
            onChange={e => setCreds({...creds, password: e.target.value})} />
          <button className="w-full bg-blue-500 text-white py-2 rounded font-bold text-sm">
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-blue-600 mt-6 block w-full">
          {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white border-b h-14 flex items-center justify-between px-10 z-10">
        <h1 className="text-xl font-bold italic">Vybe</h1>
        <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-xs font-bold text-red-500">LOGOUT</button>
      </nav>
      <div className="max-w-md mx-auto pt-24 pb-20 px-4">
        <div className="bg-gray-50 border rounded-lg h-[500px] overflow-y-auto p-4 flex flex-col space-y-3 shadow-inner">
          {chat.map((c, i) => (
            <div key={i} className={`flex flex-col ${c.user === user ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-400 px-2">{c.user}</span>
              <span className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${c.user === user ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800'}`}>
                {c.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-center">
        <div className="max-w-md w-full flex space-x-2">
          <input className="flex-grow border rounded-full px-5 py-2 text-sm outline-none bg-gray-50" 
            value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message..." 
            onKeyPress={(e) => e.key === 'Enter' && send()}/>
          <button onClick={send} className="text-blue-500 font-bold px-2">Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
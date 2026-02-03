/*import React, { useState, useEffect } from 'react';
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

export default App; */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase Project Settings > API
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function App() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [creds, setCreds] = useState({ email: '', password: '' });

  useEffect(() => {
    // 1. Listen for new messages (The "Socket.io" replacement)
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        payload => setChat(prev => [...prev, payload.new]))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp(creds);
    if (error) alert(error.message); else alert("Check email for verification!");
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword(creds);
    if (error) alert(error.message); else setUser(data.user);
  };

  const send = async () => {
    await supabase.from('messages').insert([{ sender_name: user.email, content: msg }]);
    setMsg("");
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="bg-white p-10 border w-80 text-center shadow-xl">
        <h1 className="text-3xl font-bold italic mb-6">Vybe</h1>
        <div className="space-y-2">
          <input className="w-full border p-2 text-xs" placeholder="Email" onChange={e => setCreds({...creds, email: e.target.value})} />
          <input className="w-full border p-2 text-xs" type="password" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
          <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-1.5 rounded font-bold text-sm">Log In</button>
          <button onClick={handleRegister} className="w-full border border-blue-500 text-blue-500 py-1.5 rounded text-sm mt-2">Sign Up</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* INSTAGRAM-STYLE FEED */}
      <nav className="fixed top-0 w-full bg-white border-b h-16 flex items-center justify-around z-50">
        <h1 className="text-2xl font-bold italic">Vybe</h1>
        <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="text-xs font-bold text-gray-400">LOGOUT</button>
      </nav>

      <main className="pt-24 flex justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white border rounded-sm p-4 text-center text-sm text-gray-500">
            Welcome to Vybe! Chat with friends using the floating bubble.
          </div>
        </div>
      </main>

      {/* FLOATING CHAT BUBBLE */}
      <div className="fixed bottom-6 right-6">
        <div className="w-80 h-96 bg-white shadow-2xl rounded-xl border flex flex-col overflow-hidden">
          <div className="bg-white border-b p-3 font-bold text-sm">Vybe Direct</div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 text-xs">
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.sender_name === user.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-1.5 rounded-2xl ${c.sender_name === user.email ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {c.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex bg-white">
            <input className="flex-grow text-xs outline-none bg-gray-100 rounded-full px-4 py-2" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message..." />
            <button onClick={send} className="text-blue-500 font-bold text-xs ml-2">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
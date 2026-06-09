import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#020a4e] text-white">
      <Link to="/" className="text-white font-bold text-5xl no-underline">Starcade</Link>
      <div className="flex gap-3">
        <Link to="/GlobalLeaderboard" className="px-4 py-2 rounded-md border border-white text-white bg-transparent no-underline text-sm cursor-pointer hover:bg-white/10">Leaderboard</Link>
        <Link to="/profile" className="px-4 py-2 rounded-md border border-white text-white bg-transparent no-underline text-sm cursor-pointer hover:bg-white/10">Profile</Link>
        <Link to="/login" className="px-4 py-2 rounded-md border border-white text-white bg-transparent no-underline text-sm cursor-pointer hover:bg-white/10">Login</Link>
        <Link to="/signup" className="px-4 py-2 rounded-md border border-white no-underline text-sm cursor-pointer bg-white text-black hover:bg-[#dddddd]">Sign Up</Link>
      </div>
    </nav>
  );
}

export default Navigation;
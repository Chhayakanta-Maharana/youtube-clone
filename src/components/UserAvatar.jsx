/**
 * Shared UserAvatar component to ensure 100% consistency 
 * between the Feed, Navbar, and Profile pages.
 */
const UserAvatar = ({ name = "User", avatar = "", size = "md", className = "" }) => {
    const firstLetter = (name || "U").charAt(0).toUpperCase();

    // Deterministic background color based on name
    const getBgColor = (src) => {
        const str = src || "User";
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 65%, 45%)`;
    };

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-24 h-24 text-3xl",
        xl: "w-32 h-32 text-4xl"
    };

    const currentSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div 
            className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white overflow-hidden shadow-inner ${currentSize} ${className}`}
            style={!avatar ? { backgroundColor: getBgColor(name) } : {}}
        >
            {avatar ? (
                <img 
                    src={avatar} 
                    alt={name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />
            ) : (
                <span>{firstLetter}</span>
            )}
        </div>
    );
};

export default UserAvatar;

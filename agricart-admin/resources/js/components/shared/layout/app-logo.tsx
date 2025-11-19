export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center">
                <img 
                    src="/storage/logo/SMMC Logo-1.webp" 
                    alt="SMMC Logo" 
                    className="size-9 object-contain"
                    onError={(e) => {
                        e.currentTarget.src = '/storage/logo/SMMC Logo-1.png';
                    }}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">SMMC</span>
            </div>
        </>
    );
}

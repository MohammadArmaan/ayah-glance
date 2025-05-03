import Image from "next/image";

export default function Logo() {
    return (
        <div>
            <Image src="/logo.png" height={200} width={200} alt="Logo" />
        </div>
    );
}

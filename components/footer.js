export default function Footer() {
    return (
        <footer className="mt-8 p-4 border-t text-center text-sm text-gray-600">
            <table className="centered mx-auto">
                <tr>
                    <th>
                        Horváth Csongor // 2025
                    </th>
                </tr>

                <tr>
                    <th>
                        <a href="/aboutMe" className="text-blue-500 hover:underline">
                            Rólam
                        </a>
                    </th>
                </tr>
            </table>
        </footer>
    );
}

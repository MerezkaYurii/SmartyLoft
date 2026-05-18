import { Dictionary } from "../i18n-config";


export default function Footer({ dict }: { dict: Dictionary }) {

    return (
        <footer className="bg-gray-400 text-gray-900 dark:bg-gray-900 dark:text-white py-6 fixed left-0 w-full bottom-0">
            <div className="container mx-auto px-6 text-center">
                © {new Date().getFullYear()} {"SmartyLoft"} —{" "}
                {dict.footer.text} ♥
            </div>
        </footer>
    );
}

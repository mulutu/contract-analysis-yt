import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";


const UploadCard = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Programmatically click the hidden input
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("File selected:", file.name);
            // Add file processing logic here
        }
    };
    return (
        <div className="w-full">
            <Card className="h-[300px] w-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <CardContent>
                    <Button
                        onClick={handleFileUploadClick}
                        variant="default"
                        className="flex flex-col items-center justify-center text-xl px-7 py-8 transition-colors duration-200 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Click here to analyse your first contract!
                        <span className="text-sm font-normal text-gray-200 mt-0">
                            PDF, DOCX, or TXT files accepted
                        </span>
                    </Button>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                    />
                </CardContent>
            </Card>

        </div>

    );
};

export default UploadCard;
// Compare this snippet from src/components/pricing-section.tsx:
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";
import { useState } from "react";
import { UploadModal } from "@/components/modals/upload-modal";


const UploadCard = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadComplete = () => {
        console.log("Upload complete!");
    };

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <div className="w-full">
            <Card className="h-[300px] w-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <CardContent>
                    <Button
                        //onClick={handleFileUploadClick}
                        onClick={() => setIsUploadModalOpen(true)}
                        variant="default"
                        className="flex flex-col items-center justify-center text-xl px-7 py-8 transition-colors duration-200 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Click here to analyse your first contract!
                        <span className="text-sm font-normal text-gray-200 mt-0">
                            PDF, DOCX, or TXT files accepted
                        </span>
                    </Button>                   
                </CardContent>
            </Card>
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadComplete={() => uploadComplete()}   
            />
        </div>

    );
};

export default UploadCard;
// Compare this snippet from src/components/pricing-section.tsx:
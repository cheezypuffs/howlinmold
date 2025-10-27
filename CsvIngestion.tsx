import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import * as Icons from '../Icons';

const CsvIngestion: React.FC = () => {
    return (
        <Card className="bg-black/30">
            <CardHeader>
                <CardTitle>CSV Ingestion</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-500">
                <Icons.FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>This component is a placeholder.</p>
                <p className="text-xs">Functionality has been merged into the main CSV Integration Portal.</p>
            </CardContent>
        </Card>
    );
};

export default CsvIngestion;

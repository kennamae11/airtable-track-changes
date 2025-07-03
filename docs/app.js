// Copy Editor Tracked Changes - Airtable Block
const { createElement: e, useState, useEffect } = React;

// Main App Component
function CopyEditorBlock() {
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Simulate loading (replace with actual Airtable API calls)
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
            // Mock data for demonstration
            setRecords([
                { id: 1, title: 'Document 1', status: 'Draft', lastModified: '2024-01-15' },
                { id: 2, title: 'Document 2', status: 'Review', lastModified: '2024-01-14' },
                { id: 3, title: 'Document 3', status: 'Final', lastModified: '2024-01-13' }
            ]);
        }, 1000);
    }, []);

    const handleRecordSelect = (record) => {
        setSelectedRecord(record);
    };

    const handleStatusChange = (recordId, newStatus) => {
        setRecords(prev => 
            prev.map(record => 
                record.id === recordId 
                    ? { ...record,

import {
    useBase,
    useRecords,
    useGlobalConfig,
    Box,
    Button,
    FormField,
    TablePickerSynced,
    FieldPickerSynced,
    Text,
    Heading,
    Loader,
} from '@airtable/blocks/ui';
import React, {useState, useEffect} from 'react';

function TextChangeTracker() {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    
    const tableId = globalConfig.get('selectedTableId');
    const fieldId = globalConfig.get('selectedFieldId');
    
    const table = base.getTableByIdIfExists(tableId);
    const field = table ? table.getFieldByIdIfExists(fieldId) : null;
    
    const records = useRecords(table);
    const [changes, setChanges] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [baseline, setBaseline] = useState(new Map());

    // Initialize baseline values when starting tracking
    const startTracking = () => {
        if (!field || !records) return;
        
        const newBaseline = new Map();
        records.forEach(record => {
            newBaseline.set(record.id, {
                value: record.getCellValueAsString(field) || '',
                recordName: record.name || record.id
            });
        });
        
        setBaseline(newBaseline);
        setIsTracking(true);
    };

    const stopTracking = () => {
        setIsTracking(false);
    };

    const clearChanges = () => {
        setChanges([]);
    };

    // Check for changes when records update
    useEffect(() => {
        if (!field || !isTracking || !records || baseline.size === 0) return;
        
        const newChanges = [];
        
        records.forEach(record => {
            const currentValue = record.getCellValueAsString(field) || '';
            const baselineData = baseline.get(record.id);
            
            if (baselineData && baselineData.value !== currentValue) {
                newChanges.push({
                    id: `${record.id}-${Date.now()}`,
                    recordId: record.id,
                    recordName: record.name || record.id,
                    fieldName: field.name,
                    previousValue: baselineData.value,
                    currentValue: currentValue,
                    timestamp: new Date().toISOString()
                });
                
                // Update baseline to current value
                setBaseline(prev => new Map(prev.set(record.id, {
                    value: currentValue,
                    recordName: record.name || record.id
                })));
            }
        });
        
        if (newChanges.length > 0) {
            setChanges(prev => [...prev, ...newChanges]);
        }
    }, [records, field, isTracking, baseline]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Box padding={3}>
            <Heading size="large" marginBottom={3}>
                📝 Text Change Tracker
            </Heading>
            
            <Box marginBottom={3}>
                <FormField label="Select table" marginBottom={2}>
                    <TablePickerSynced globalConfigKey="selectedTableId" />
                </FormField>
                
                {table && (
                    <FormField label="Select long text field">
                        <FieldPickerSynced
                            table={table}
                            globalConfigKey="selectedFieldId"
                            allowedTypes={['multilineText', 'richText']}
                        />
                    </FormField>
                )}
            </Box>
            
            {field && (
                <Box marginBottom={3}>
                    <Button
                        variant="primary"
                        onClick={startTracking}
                        disabled={isTracking}
                        marginRight={2}
                    >
                        {isTracking ? 'Tracking...' : 'Start Tracking'}
                    </Button>
                    <Button
                        onClick={stopTracking}
                        disabled={!isTracking}
                        marginRight={2}
                    >
                        Stop Tracking
                    </Button>
                    <Button onClick={clearChanges} variant="secondary">
                        Clear History
                    </Button>
                </Box>
            )}
            
            {!table && (
                <Box marginTop={3}>
                    <Text textColor="light">
                        👆 Please select a table to get started
                    </Text>
                </Box>
            )}
            
            {table && !field && (
                <Box marginTop={3}>
                    <Text textColor="light">
                        👆 Please select a long text field to track
                    </Text>
                </Box>
            )}
            
            {isTracking && field && (
                <Box marginTop={3} padding={2} backgroundColor="lightGray1" borderRadius="default">
                    <Text textColor="green">
                        ✅ Currently tracking changes in "{field.name}" field
                    </Text>
                    <Text size="small" textColor="light">
                        Monitoring {records ? records.length : 0} records
                    </Text>
                </Box>
            )}
            
            {changes.length > 0 && (
                <Box marginTop={4}>
                    <Heading size="medium" marginBottom={3}>
                        📊 Change History ({changes.length} changes)
                    </Heading>
                    
                    <Box maxHeight="400px" overflowY="auto">
                        {changes.reverse().map((change, index) => (
                            <Box 
                                key={change.id} 
                                border="thick" 
                                borderColor="lightGray2"
                                padding={3} 
                                marginBottom={2}
                                borderRadius="default"
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                                    <Text fontWeight="strong" size="large">
                                        {change.recordName}
                                    </Text>
                                    <Text size="small" textColor="light">
                                        {formatTimestamp(change.timestamp)}
                                    </Text>
                                </Box>
                                
                                <Box marginBottom={2}>
                                    <Text size="small" textColor="light" fontWeight="strong">
                                        BEFORE:
                                    </Text>
                                    <Box 
                                        padding={2} 
                                        backgroundColor="lightGray1" 
                                        borderRadius="default"
                                        marginTop={1}
                                    >
                                        <Text size="small">
                                            {change.previousValue || '(empty)'}
                                        </Text>
                                    </Box>
                                </Box>
                                
                                <Box>
                                    <Text size="small" textColor="light" fontWeight="strong">
                                        AFTER:
                                    </Text>
                                    <Box 
                                        padding={2} 
                                        backgroundColor="lightGray1" 
                                        borderRadius="default"
                                        marginTop={1}
                                    >
                                        <Text size="small">
                                            {change.currentValue || '(empty)'}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
            
            {changes.length === 0 && isTracking && (
                <Box marginTop={4}>
                    <Text textColor="light">
                        No changes detected yet. Try editing some records in the "{field?.name}" field.
                    </Text>
                </Box>
            )}
        </Box>
    );
}

export default TextChangeTracker;

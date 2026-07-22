import React, { useState } from 'react';
import {
    Paper, Typography, TextField, MenuItem, Button, Box,
    IconButton, Alert, CircularProgress, Grid, FormControl, InputLabel, Select,
    Snackbar
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { inventarioService } from '../../services/inventarioService';
import type { ProductoManagement } from '../../src/types/producto';
import type { Ubicacion, Proveedor } from '../../src/types/inventario';

interface EntradaProductoFormProps {
    productos: ProductoManagement[];
    proveedores: Proveedor[];
    ubicaciones: Ubicacion[];
    onSuccess: () => void;
}

const EntradaProductoForm: React.FC<EntradaProductoFormProps> = ({
    productos, proveedores, ubicaciones, onSuccess
}) => {
    const [productoId, setProductoId] = useState<number | ''>('');
    const [cantidad, setCantidad] = useState<number>(1);
    const [costoUnitario, setCostoUnitario] = useState<number | ''>('');
    const [referencia, setReferencia] = useState('');
    const [motivo, setMotivo] = useState('');
    const [numerosSerie, setNumerosSerie] = useState<{ numero: string; proveedorId: number; ubicacionId?: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

    const handleAddNumeroSerie = () => {
        if (numerosSerie.length < cantidad) {
            setNumerosSerie([...numerosSerie, { numero: '', proveedorId: 0 }]);
        }
    };

    const handleRemoveNumeroSerie = (index: number) => {
        setNumerosSerie(numerosSerie.filter((_, i) => i !== index));
    };

    const handleNumeroSerieChange = (index: number, field: string, value: any) => {
        const updated = [...numerosSerie];
        updated[index] = { ...updated[index], [field]: value };
        setNumerosSerie(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoId) {
            setSnackbarMessage('Seleccione un producto');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const request = {
                productoId: Number(productoId),
                tipoMovimiento: 'Entrada',
                cantidad,
                motivo: motivo || undefined,
                referencia: referencia || undefined,
                costoUnitario: costoUnitario ? Number(costoUnitario) : undefined,
                numerosSerie: numerosSerie.map(ns => ({
                    numeroSerie: ns.numero,
                    proveedorId: ns.proveedorId,
                    ubicacionId: ns.ubicacionId
                }))
            };
            await inventarioService.registrarEntrada(request);
            setSnackbarMessage('Entrada registrada exitosamente');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setProductoId('');
            setCantidad(1);
            setCostoUnitario('');
            setReferencia('');
            setMotivo('');
            setNumerosSerie([]);
            onSuccess();
        } catch (err: any) {
            setSnackbarMessage(err.response?.data?.message || 'Error al registrar entrada');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Registrar Entrada de Producto</Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid size={{xs:12, md: 6}}>
                        <FormControl fullWidth required>
                            <InputLabel>Producto</InputLabel>
                            <Select
                                value={productoId}
                                label="Producto"
                                onChange={(e) => setProductoId(e.target.value as number)}
                            >
                                {productos.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.nombreCompleto}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            label="Cantidad"
                            type="number"
                            fullWidth
                            required
                            value={cantidad}
                            onChange={(e) => setCantidad(Number(e.target.value))}
                            inputProps={{ min: 1 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            label="Costo Unitario"
                            type="number"
                            fullWidth
                            value={costoUnitario}
                            onChange={(e) => setCostoUnitario(e.target.value ? Number(e.target.value) : '')}
                            inputProps={{ step: '0.01' }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Referencia (ej. factura)"
                            fullWidth
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label="Motivo"
                            fullWidth
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Números de Serie</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Debes ingresar {cantidad} número(s) de serie. Puedes agregarlos manualmente.
                    </Typography>

                    {numerosSerie.map((ns, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            <TextField
                                label="Número de Serie"
                                size="small"
                                value={ns.numero}
                                onChange={(e) => handleNumeroSerieChange(index, 'numero', e.target.value)}
                                required
                                sx={{ flex: 2 }}
                            />
                            <FormControl size="small" sx={{ flex: 1 }}>
                                <InputLabel>Proveedor</InputLabel>
                                <Select
                                    value={ns.proveedorId}
                                    label="Proveedor"
                                    onChange={(e) => handleNumeroSerieChange(index, 'proveedorId', e.target.value)}
                                    required
                                >
                                    {proveedores.map(p => (
                                        <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ flex: 1 }}>
                                <InputLabel>Ubicación</InputLabel>
                                <Select
                                    value={ns.ubicacionId || ''}
                                    label="Ubicación"
                                    onChange={(e) => handleNumeroSerieChange(index, 'ubicacionId', e.target.value)}
                                >
                                    <MenuItem value="">Seleccionar</MenuItem>
                                    {ubicaciones.map(u => (
                                        <MenuItem key={u.id} value={u.id}>{u.nombre} ({u.codigo})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <IconButton color="error" onClick={() => handleRemoveNumeroSerie(index)}>
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}

                    {numerosSerie.length < cantidad && (
                        <Button startIcon={<Add />} onClick={handleAddNumeroSerie} sx={{ mt: 1 }}>
                            Agregar Número de Serie
                        </Button>
                    )}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Registrar Entrada'}
                    </Button>
                </Box>
            </form>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={7000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default EntradaProductoForm;

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Alert from '../models/Alert';

export const getAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = (req.query.patientId as string) || req.user?.firebaseUid;
    const filter: any = {};
    if (patientId) filter.patientId = patientId;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const updateAlertStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

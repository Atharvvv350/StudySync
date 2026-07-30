import { Request, Response } from 'express';
import { StudyMaterial } from './studyMaterial.model';
import { notifyAllStudents } from '../notifications/notifications.controller';
import { AuthRequest } from '../../middleware/auth.middleware';
import cloudinary from '../../config/cloudinary';
import fs from 'fs';

export const createStudyMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, content, type, board, grade, subject, chapter, topic, tags, videos } = req.body;

        // Handle PDF uploads
        const pdfs: { title: string; url: string }[] = [];
        if (req.files && Array.isArray(req.files)) {
            (req.files as any[]).forEach((file: any) => {
                pdfs.push({
                    title: file.originalname,
                    url: file.path
                });
            });
        }

        // Parse videos if sent as string (from FormData)
        let parsedVideos = [];
        if (videos) {
            try {
                parsedVideos = typeof videos === 'string' ? JSON.parse(videos) : videos;
            } catch (e) {
                console.error("Error parsing videos:", e);
                parsedVideos = [];
            }
        }

        const material = await StudyMaterial.create({
            title,
            description,
            content,
            type: type || 'topic',
            pdfs,
            videos: parsedVideos,
            url: pdfs.length > 0 ? pdfs[0].url : '', // Fallback URL for backward compatibility
            board,
            grade,
            subject,
            chapter,
            topic,
            tags: tags ? tags.split(',') : [],
            uploadedBy: req.user._id,
        });

        // Notify all students
        await notifyAllStudents(`New Study Material: ${title} (${subject})`, 'info');

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getStudyMaterials = async (req: Request, res: Response) => {
    try {
        const { board, grade, subject, chapter, topic, tags, search, limit } = req.query;
        const query: any = {};

        if (board) query.board = board;
        if (grade) query.grade = grade;
        if (subject) query.subject = subject;
        if (chapter) query.chapter = chapter;
        if (topic) query.topic = topic;
        if (tags) query.tags = { $in: (tags as string).split(',') };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const materialQuery = StudyMaterial.find(query).populate('uploadedBy', 'name');

        if (limit) {
            materialQuery.limit(Number(limit));
        }

        const materials = await materialQuery;
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getStudyMaterialById = async (req: Request, res: Response) => {
    try {
        const material = await StudyMaterial.findById(req.params.id).populate('uploadedBy', 'name');
        if (material) {
            material.views += 1;
            await material.save();
            res.json(material);
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteStudyMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);

        if (material) {
            if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this material' });
            }

            await material.deleteOne();
            res.json({ message: 'Material removed' });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateStudyMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, content, type, board, grade, subject, chapter, topic, tags, videos, existingPdfs } = req.body;
        const material = await StudyMaterial.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Handle PDF uploads (New Files)
        const newPdfs: { title: string; url: string }[] = [];
        if (req.files && Array.isArray(req.files)) {
            (req.files as any[]).forEach((file: any) => {
                newPdfs.push({
                    title: file.originalname,
                    url: file.path
                });
            });
        }

        // Handle Existing PDFs (Keep only those sent in existingPdfs)
        let keptPdfs: { title: string; url: string }[] = [];
        if (existingPdfs) {
            try {
                keptPdfs = typeof existingPdfs === 'string' ? JSON.parse(existingPdfs) : existingPdfs;
            } catch (e) {
                console.error("Error parsing existingPdfs:", e);
                keptPdfs = [];
            }
        }

        // Combine kept and new PDFs
        const finalPdfs = [...keptPdfs, ...newPdfs];

        // Parse videos
        let parsedVideos = [];
        if (videos) {
            try {
                parsedVideos = typeof videos === 'string' ? JSON.parse(videos) : videos;
            } catch (e) {
                console.error("Error parsing videos:", e);
                parsedVideos = [];
            }
        }

        // Update fields
        material.title = title || material.title;
        material.description = description || material.description;
        material.content = content || material.content;
        material.type = type || material.type;
        material.board = board || material.board;
        material.grade = grade || material.grade;
        material.subject = subject || material.subject;
        material.chapter = chapter || material.chapter;
        material.topic = topic || material.topic;
        material.tags = tags ? tags.split(',') : material.tags;
        material.pdfs = finalPdfs;
        material.videos = parsedVideos;

        // Fallback URL update
        if (finalPdfs.length > 0) {
            material.url = finalPdfs[0].url;
        }

        await material.save();
        res.json(material);

    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: (error as Error).message });
    }
};

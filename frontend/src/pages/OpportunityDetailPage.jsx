import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunityAPI } from '../api/opportunities';
import { bookmarkAPI } from '../api/bookmarks';
import toast from 'react-hot-toast';

import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';

import {
  ArrowLeft, Calendar, MapPin, ExternalLink, Bookmark, BookmarkCheck,
  Users, Trophy, Clock, Globe, Building2, Tag, GraduationCap,
  Share2, AlertCircle,
} from 'lucide-react';

const TYPE_CONFIG = {
  competition: { color: '#CBFF47', bg: 'rgba(203,255,71,0.08)', border: 'rgba(203,255,71,0.2)', label: 'Competition' },
  scholarship: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', label: 'Scholarship' },
  workshop: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Workshop' },
  event: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', label: 'Event' },
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Icon size={15} style={{ color: 'var(--text-muted)' }} />
      <div>
        <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await opportunityAPI.getOne(id);
        setOpportunity(data.opportunity);

        if (isAuthenticated && isStudent) {
          const bRes = await bookmarkAPI.check(data.opportunity._id);
          setIsBookmarked(bRes.data.isBookmarked);
        }
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
        else toast.error('Failed to load opportunity');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, isStudent]);

  const handleBookmark = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!isStudent) return toast.error('Only students allowed');

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await bookmarkAPI.remove(opportunity._id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.add(opportunity._id);
        setIsBookmarked(true);
      }
    } catch {
      toast.error('Error updating bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const daysLeft = opportunity
    ? Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) return <LoadingSpinner />;
  if (notFound) return <div>Not Found</div>;

  const typeC = TYPE_CONFIG[opportunity?.type] || TYPE_CONFIG.event;

  return (
    <div>
      <Navbar />

      <div className="max-w-5xl mx-auto p-4">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        <h1>{opportunity.title}</h1>

        {/* Apply Button FIXED */}
        {opportunity.registrationLink && (
          <a
            href={opportunity.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-400 text-black p-3 rounded mt-4"
          >
            <ExternalLink size={14} /> Apply Now
          </a>
        )}

        {/* Bookmark */}
        <button onClick={handleBookmark} disabled={bookmarkLoading}>
          {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
        </button>

        {/* Share */}
        <button onClick={handleShare}>
          <Share2 /> Share
        </button>

        {/* Info */}
        <InfoRow icon={Calendar} label="Deadline" value={opportunity.deadline} />
        <InfoRow icon={MapPin} label="Location" value={opportunity.city} />
        <InfoRow icon={Trophy} label="Prize" value={opportunity.prize} />

        {/* Description */}
        <p>{opportunity.description}</p>

      </div>
    </div>
  );
}
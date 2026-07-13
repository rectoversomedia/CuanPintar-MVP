'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Share2, QrCode, Settings, RefreshCw, ExternalLink } from 'lucide-react';

interface QRCodeGeneratorProps {
  linkId: string;
  url?: string;
  title?: string;
  defaultSize?: number;
  showPreview?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
}

interface QROptions {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

const DEFAULT_OPTIONS: QROptions = {
  size: 300,
  margin: 4,
  foreground: '#000000',
  background: '#FFFFFF',
  errorCorrection: 'M',
};

const PRESET_COLORS = [
  { name: 'Black', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Dark Blue', fg: '#1E3A8A', bg: '#FFFFFF' },
  { name: 'Green', fg: '#059669', bg: '#FFFFFF' },
  { name: 'Purple', fg: '#7C3AED', bg: '#FFFFFF' },
  { name: 'Dark', fg: '#FFFFFF', bg: '#000000' },
];

const PRESET_SIZES = [128, 256, 300, 400, 512, 768, 1024];

export function QRCodeGenerator({
  linkId,
  url,
  title,
  defaultSize = 300,
  showPreview = true,
  onCopy,
  onDownload,
}: QRCodeGeneratorProps) {
  const [options, setOptions] = useState<QROptions>({
    ...DEFAULT_OPTIONS,
    size: defaultSize,
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate QR code
  const generateQR = useCallback(async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        format: 'base64',
        size: options.size.toString(),
        margin: options.margin.toString(),
        fg: options.foreground,
        bg: options.background,
        error: options.errorCorrection,
      });

      const response = await fetch(`/api/links/${linkId}/qr?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setQrDataUrl(data.data);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
    } finally {
      setIsLoading(false);
    }
  }, [linkId, url, options.size, options.margin, options.foreground, options.background, options.errorCorrection]);

  useEffect(() => {
    if (url && showPreview) {
      generateQR();
    }
  }, [url, showPreview, generateQR]);

  // Copy QR code image
  const handleCopyQR = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy QR:', error);
      // Fallback: copy URL
      if (url) {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Download QR code
  const handleDownload = async () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${linkId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  };

  // Share QR code
  const handleShare = async () => {
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Share Link',
          text: 'Check out this link!',
          url: url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Apply color preset
  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setOptions((prev) => ({
      ...prev,
      foreground: preset.fg,
      background: preset.bg,
    }));
  };

  if (!showPreview) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="w-4 h-4" />
            Generate QR
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
          </DialogHeader>
          <QRCodeContent
            linkId={linkId}
            url={url}
            title={title}
            options={options}
            setOptions={setOptions}
            qrDataUrl={qrDataUrl}
            isLoading={isLoading}
            copied={copied}
            onGenerate={generateQR}
            onCopy={handleCopyQR}
            onDownload={handleDownload}
            onShare={handleShare}
            applyPreset={applyPreset}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code
            </CardTitle>
            {title && (
              <CardDescription className="mt-1">{title}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Preview */}
        <div className="flex justify-center bg-white p-4 rounded-lg">
          {isLoading ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-48 h-48"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-muted-foreground text-sm">
              No URL provided
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={handleCopyQR}
            disabled={!qrDataUrl}
          >
            {copied ? (
              <>
                <Copy className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={handleDownload}
            disabled={!qrDataUrl}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={!url}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Settings</DialogTitle>
          </DialogHeader>
          <QRCodeContent
            linkId={linkId}
            url={url}
            title={title}
            options={options}
            setOptions={setOptions}
            qrDataUrl={qrDataUrl}
            isLoading={isLoading}
            copied={copied}
            onGenerate={generateQR}
            onCopy={handleCopyQR}
            onDownload={handleDownload}
            onShare={handleShare}
            applyPreset={applyPreset}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// QR Code Settings Content Component
function QRCodeContent({
  linkId,
  url,
  title,
  options,
  setOptions,
  qrDataUrl,
  isLoading,
  copied,
  onGenerate,
  onCopy,
  onDownload,
  onShare,
  applyPreset,
}: {
  linkId?: string;
  url?: string;
  title?: string;
  options: QROptions;
  setOptions: (options: QROptions) => void;
  qrDataUrl: string;
  isLoading: boolean;
  copied: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
  applyPreset: (preset: typeof PRESET_COLORS[0]) => void;
}) {
  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="customize">Customize</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="space-y-4 pt-4">
        {/* Preview */}
        <div className="flex justify-center bg-white p-6 rounded-lg border">
          {isLoading ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Preview"
              style={{ width: options.size, height: options.size }}
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
              {url ? 'Generating...' : 'No URL provided'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-1"
            onClick={onCopy}
            disabled={!qrDataUrl}
          >
            {copied ? <Copy className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1"
            onClick={onDownload}
            disabled={!qrDataUrl}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button variant="outline" onClick={onShare} disabled={!url}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {url && (
          <div className="flex gap-2">
            <Input value={url} readOnly className="flex-1 text-sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="customize" className="space-y-4 pt-4">
        {/* Size */}
        <div className="space-y-2">
          <Label>Size</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_SIZES.map((size) => (
              <Button
                key={size}
                variant={options.size === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOptions({ ...options, size })}
              >
                {size}px
              </Button>
            ))}
          </div>
        </div>

        {/* Color Presets */}
        <div className="space-y-2">
          <Label>Color Presets</Label>
          <div className="flex gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
                  options.foreground === preset.fg && options.background === preset.bg
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted'
                }`}
              >
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: preset.bg,
                    border: `2px solid ${preset.fg}`,
                  }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foreground">Foreground</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={options.foreground}
                onChange={(e) => setOptions({ ...options, foreground: e.target.value })}
                className="w-10 h-10 p-0 border-0"
              />
              <Input
                value={options.foreground}
                onChange={(e) => setOptions({ ...options, foreground: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={options.background}
                onChange={(e) => setOptions({ ...options, background: e.target.value })}
                className="w-10 h-10 p-0 border-0"
              />
              <Input
                value={options.background}
                onChange={(e) => setOptions({ ...options, background: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Error Correction */}
        <div className="space-y-2">
          <Label>Error Correction</Label>
          <Select
            value={options.errorCorrection}
            onValueChange={(value: 'L' | 'M' | 'Q' | 'H') =>
              setOptions({ ...options, errorCorrection: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (7%)</SelectItem>
              <SelectItem value="M">Medium (15%)</SelectItem>
              <SelectItem value="Q">Quartile (25%)</SelectItem>
              <SelectItem value="H">High (30%)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Higher levels allow logos to be added but increase QR density
          </p>
        </div>

        {/* Generate Button */}
        <Button onClick={onGenerate} disabled={isLoading || !url} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              Regenerate QR
            </>
          )}
        </Button>
      </TabsContent>
    </Tabs>
  );
}

// Simplified QR Code for inline use
export function QRCodeInline({
  linkId,
  url,
  size = 128,
}: {
  linkId: string;
  url: string;
  size?: number;
}) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await fetch(
          `/api/links/${linkId}/qr?format=base64&size=${size}`
        );
        const data = await response.json();
        if (data.success) {
          setQrUrl(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch QR:', error);
      }
    };

    if (linkId && url) {
      fetchQR();
    }
  }, [linkId, url, size]);

  if (!qrUrl) {
    return (
      <div
        className="bg-muted animate-pulse rounded"
        style={{ width: size, height: size }}
      />
    );
  }

  return <img src={qrUrl} alt="QR Code" style={{ width: size, height: size }} />;
}

export default QRCodeGenerator;

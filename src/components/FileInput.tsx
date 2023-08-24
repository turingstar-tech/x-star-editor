import classNames from 'classnames';
import React, { useState } from 'react';
import { useLocale } from '../locales';
import { prefix } from '../utils/global';

interface FileInputProps {
  onCancel: () => void;
  onOk: (
    data: ({ type: 'file'; file: File } | { type: 'url'; url: string }) & {
      description: string;
    },
  ) => void;
}

const FileInput = ({ onCancel, onOk }: FileInputProps) => {
  const [type, setType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const { format: t } = useLocale('fileInput');

  return (
    <div className={classNames(`${prefix}file-input`)}>
      <div className={classNames(`${prefix}tabs`)}>
        <div
          className={classNames(`${prefix}tab`, {
            [`${prefix}active`]: type === 'file',
          })}
          onClick={() => setType('file')}
        >
          {t('file')}
        </div>
        <div
          className={classNames(`${prefix}tab`, {
            [`${prefix}active`]: type === 'url',
          })}
          onClick={() => setType('url')}
        >
          {t('url')}
        </div>
      </div>
      {type === 'file' ? (
        <label className={classNames(`${prefix}field`)}>
          {t('file')}
          <div className={classNames(`${prefix}file-container`)}>
            <input
              className={classNames(`${prefix}hidden`)}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <input
              className={classNames(`${prefix}input`)}
              readOnly
              value={file?.name ?? ''}
            />
            <button className={classNames(`${prefix}button`)} type="button">
              {t('chooseFile')}
            </button>
          </div>
        </label>
      ) : (
        <label className={classNames(`${prefix}field`)}>
          {t('url')}
          <input
            className={classNames(`${prefix}input`)}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      )}
      <label className={classNames(`${prefix}field`)}>
        {t('description')}
        <input
          className={classNames(`${prefix}input`)}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className={classNames(`${prefix}buttons`)}>
        <button
          className={classNames(`${prefix}button`, `${prefix}primary`)}
          type="button"
          onClick={() => {
            if (type === 'file' && file) {
              onOk({ type, file, description });
            } else if (type === 'url' && url) {
              onOk({ type, url, description });
            }
          }}
        >
          {t('confirm')}
        </button>
        <button
          className={classNames(`${prefix}button`)}
          type="button"
          onClick={onCancel}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

export default FileInput;

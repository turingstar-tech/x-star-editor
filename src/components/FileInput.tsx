import classNames from 'classnames/bind';
import React, { useState } from 'react';
import styles from './FileInput.module.css';

const cx = classNames.bind(styles);

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

  return (
    <div className={cx('container')}>
      <div className={cx('tabs')}>
        <div
          className={cx('tab', { active: type === 'file' })}
          onClick={() => setType('file')}
        >
          文件
        </div>
        <div
          className={cx('tab', { active: type === 'url' })}
          onClick={() => setType('url')}
        >
          网址
        </div>
      </div>
      {type === 'file' ? (
        <label className={cx('field')}>
          文件
          <div className={cx('file-container')}>
            <input
              className={cx('hidden')}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <input className={cx('input')} readOnly value={file?.name ?? ''} />
            <button className={cx('button')} type="button">
              选择文件
            </button>
          </div>
        </label>
      ) : (
        <label className={cx('field')}>
          网址
          <input
            className={cx('input')}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      )}
      <label className={cx('field')}>
        描述
        <input
          className={cx('input')}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className={cx('buttons')}>
        <button
          className={cx('button', 'primary')}
          type="button"
          onClick={() => {
            if (type === 'file' && file) {
              onOk({ type, file, description });
            } else if (type === 'url' && url) {
              onOk({ type, url, description });
            }
          }}
        >
          确定
        </button>
        <button className={cx('button')} type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
};

export default FileInput;

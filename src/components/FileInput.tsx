import classNames from 'classnames';
import React, { useState } from 'react';
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

  return (
    <div className={classNames(`${prefix}file-input`)}>
      <div className={classNames(`${prefix}tabs`)}>
        <div
          className={classNames(`${prefix}tab`, {
            [`${prefix}active`]: type === 'file',
          })}
          onClick={() => setType('file')}
        >
          文件
        </div>
        <div
          className={classNames(`${prefix}tab`, {
            [`${prefix}active`]: type === 'url',
          })}
          onClick={() => setType('url')}
        >
          网址
        </div>
      </div>
      {type === 'file' ? (
        <label className={classNames(`${prefix}field`)}>
          文件
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
              选择文件
            </button>
          </div>
        </label>
      ) : (
        <label className={classNames(`${prefix}field`)}>
          网址
          <input
            className={classNames(`${prefix}input`)}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      )}
      <label className={classNames(`${prefix}field`)}>
        描述
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
          确定
        </button>
        <button
          className={classNames(`${prefix}button`)}
          type="button"
          onClick={onCancel}
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default FileInput;

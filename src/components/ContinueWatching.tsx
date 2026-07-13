/* eslint-disable no-console */
'use client';

import { Clock, Trash2 } from 'lucide-react';
import { useEffect, useState, memo } from 'react';

import type { PlayRecord } from '@/lib/db.client';
// 🚀 TanStack Query Mutations
import { useClearPlayRecordsMutation } from '@/hooks/usePlayRecordsMutations';
// 🚀 TanStack Query Queries
import { useContinueWatchingQuery } from '@/hooks/useContinueWatchingQueries';

import ScrollableRow from '@/components/ScrollableRow';
import SectionTitle from '@/components/SectionTitle';
import VideoCard from '@/components/VideoCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ContinueWatchingProps {
  className?: string;
}

// 🚀 优化方案6：使用React.memo防止不必要的重渲染
function ContinueWatching({ className }: ContinueWatchingProps) {
  const [requireClearConfirmation, setRequireClearConfirmation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 🚀 TanStack Query - 播放记录
  const { data: playRecords = [], isLoading: loading } = useContinueWatchingQuery();

  // 🚀 TanStack Query - 观看更新（仅当有播放记录时才查询）
  const clearPlayRecordsMutation = useClearPlayRecordsMutation();

  // 读取清空确认设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRequireClearConfirmation = localStorage.getItem('requireClearConfirmation');
      if (savedRequireClearConfirmation !== null) {
        setRequireClearConfirmation(JSON.parse(savedRequireClearConfirmation));
      }
    }
  }, []);

  // 如果没有播放记录，则不渲染组件
  if (!loading && playRecords.length === 0) {
    return null;
  }

  // 计算播放进度百分比
  const getProgress = (record: PlayRecord) => {
    if (record.total_time === 0) return 0;
    return (record.play_time / record.total_time) * 100;
  };

  // 从 key 中解析 source 和 id
  const parseKey = (key: string) => {
    const [source, id] = key.split('+');
    return { source, id };
  };

  // 清空全部播放记录
  const handleClearAll = () => {
    // 🚀 使用 mutation.mutate() 清空播放记录
    // 特性：立即清空 UI（乐观更新），失败时自动回滚
    clearPlayRecordsMutation.mutate();
    setShowConfirmDialog(false);
  };

  return (
    <section className={`mb-8 ${className || ''}`}>
      <div className='mb-4 flex items-center justify-between'>
        <SectionTitle title="继续观看" icon={Clock} iconColor="text-green-500" />
        {!loading && playRecords.length > 0 && (
          <button
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 border border-red-300 dark:border-red-700 hover:border-red-600 dark:hover:border-red-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md'
            onClick={() => {
              // 根据用户设置决定是否显示确认对话框
              if (requireClearConfirmation) {
                setShowConfirmDialog(true);
              } else {
                handleClearAll();
              }
            }}
          >
            <Trash2 className='w-4 h-4' />
            <span>清空</span>
          </button>
        )}
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="确认清空"
        message={`确定要清空所有继续观看记录吗？\n\n这将删除 ${playRecords.length} 条播放记录，此操作无法撤销。`}
        confirmText="确认清空"
        cancelText="取消"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setShowConfirmDialog(false)}
      />
      <ScrollableRow>
        {loading
          ? // 加载状态显示灰色占位数据
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='min-w-[96px] w-24 sm:min-w-[180px] sm:w-44'
              >
                <div className='relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse dark:bg-gray-800'>
                  <div className='absolute inset-0 bg-gray-300 dark:bg-gray-700'></div>
                </div>
                <div className='mt-2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800'></div>
                <div className='mt-1 h-3 bg-gray-200 rounded animate-pulse dark:bg-gray-800'></div>
              </div>
            ))
          : // 显示真实数据
            playRecords.map((record, index) => {
              const { source, id } = parseKey(record.key);
              // 优先使用播放记录中保存的 type，否则根据集数判断
              const cardType = record.type || (record.total_episodes > 1 ? 'tv' : '');
              return (
                <div
                  key={record.key}
                  className='min-w-[96px] w-24 sm:min-w-[180px] sm:w-44 relative group/card'
                >
                  <div className='relative group-hover/card:z-5 transition-all duration-300'>
                    <VideoCard
                      id={id}
                      title={record.title}
                      poster={record.cover}
                      year={record.year}
                      source={source}
                      source_name={record.source_name}
                      progress={getProgress(record)}
                      episodes={record.total_episodes}
                      currentEpisode={record.index}
                      query={record.search_title}
                      from='playrecord'
                      type={cardType}
                      remarks={record.remarks}
                      priority={index < 4}
                      douban_id={record.douban_id}
                    />
                  </div>
                  {/* 新集数徽章 - Netflix 统一风格 */}
                </div>
              );
            })}
      </ScrollableRow>
    </section>
  );
}

export default memo(ContinueWatching);

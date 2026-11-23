import React from 'react';
import {mix} from '../../motion';
import {tagColours} from '../../tokens';
import {Chip} from '../../components/Chip';
import {IntegrationTile} from './IntegrationTile';

export const MCP_TILE_HEIGHT = 140;

/** MCP server tile with a reserved row of Tool chips. */
export const McpTile: React.FC<{
  name: string;
  detail: string;
  status: React.ReactNode;
  tools: string[];
  toolsIn: number[];
}> = ({name, detail, status, tools, toolsIn}) => (
  <IntegrationTile kind="plug" name={name} detail={detail} status={status} height={MCP_TILE_HEIGHT}>
    <div style={{display: 'flex', gap: 8}}>
      {tools.map((t, i) => (
        <div key={t} style={{opacity: toolsIn[i] ?? 0, transform: `translateY(${mix(12, 0, toolsIn[i] ?? 0)}px)`}}>
          <Chip label={t} fontSize={13} height={28} paddingX={10} radius={8} background={tagColours.tool.background} color={tagColours.tool.text} />
        </div>
      ))}
    </div>
  </IntegrationTile>
);

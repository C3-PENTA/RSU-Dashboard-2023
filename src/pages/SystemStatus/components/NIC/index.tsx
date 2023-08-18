import {
  Table,
  Title,
  Box,
  createStyles,
  rem,
  ScrollArea,
  Group,
  Popover,
  NavLink,
  Chip,
} from '@mantine/core';
import { AvailEventData } from '../..';
import { useEffect, useState } from 'react';
import { Adjustments } from 'tabler-icons-react';

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colors.gray[6],
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
  },

  headerCell: {
    borderBottom: 'none',
  },

  text: {
    color: theme.white,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    lineHeight: '20px',
  },

  row: {
    backgroundColor: theme.colors.gray[7],
  },

  cell: {
    borderBottom: `${rem(1)} solid ${theme.colors['white-alpha'][2]}`,
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface NICDataProp {
  data: AvailEventData[];
}
const NIC = (props: NICDataProp) => {
  const { data } = props;
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedNodeIds(data.map((item) => item.nodeId));
  }, [data]);

  const handleChipClick = (nodeId: string) => {
    setSelectedNodeIds((prevSelectedNodeIds) => {
      if (prevSelectedNodeIds.includes(nodeId)) {
        return prevSelectedNodeIds.filter((id) => id !== nodeId);
      } else {
        return [...prevSelectedNodeIds, nodeId];
      }
    });
  };

  const filteredData = data.filter((item) => selectedNodeIds.includes(item.nodeId));

  const rows = filteredData.map((element) => (
    <tr key={element.nodeId}>
      <td className={cx(classes.cell)}>{element.nodeId}</td>
      <td className={cx(classes.cell)}>{element.nodeId}</td>
      <td className={cx(classes.cell)}>{element.networkStatus}</td>
      <td className={cx(classes.cell)}>{element.networkSpeed}</td>
      <td className={cx(classes.cell)}>{element.networkUsage}</td>
    </tr>
  ));

  const renderList = (
    <Popover.Dropdown
      sx={(theme) => ({
        width: '1vw',
        alignItems: 'center',
        backgroundColor: theme.colors.gray[5],
        borderRadius: theme.radius['2xl'],
        border: `1px solid ${theme.colors['white-alpha'][2]}`,
      })}
    >
      {data.map((item) => {
        return (
          <Chip
            key={item.nodeId}
            mb={'xs'}
            variant="light"
            checked={selectedNodeIds.includes(item.nodeId)}
            onClick={() => handleChipClick(item.nodeId)}
          >
            {item.nodeId}
          </Chip>
        );
      })}
    </Popover.Dropdown>
  );
  const handlePopoverToggle = () => {
    setIsOpen(!isOpen);
  };
  const title = (
    <Group style={{ height: '15%', display: 'flex', justifyContent: 'center' }}>
      <Popover
        width={120}
        trapFocus
        position="bottom"
        shadow="md"
        opened={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Popover.Target>
          <NavLink
            className="rsu-list parent"
            sx={(theme) => ({
              width: 'auto',
              '&:hover': {
                borderRadius: theme.radius['md'],
                backgroundColor: theme.colors.gray[6],
              },
            })}
            label={
              <Title order={6} color="white">
                NIC
              </Title>
            }
            onClick={handlePopoverToggle}
            rightSection={<Adjustments size={20} strokeWidth={2} color={'white'} />}
          ></NavLink>
        </Popover.Target>
        {renderList}
      </Popover>
    </Group>
  );
  return (
    <Box
      id="nic"
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        padding: '0.8vw',
        backgroundColor: theme.colors.gray[7],
        boxShadow: theme.shadows.base,
      })}
    >
      {title}
      {data.length > 5 && (
        <ScrollArea h={260} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
          <Table verticalSpacing="xs">
            <thead
              className={cx(classes.header, { [classes.scrolled]: scrolled })}
              style={{ zIndex: 1 }}
            >
              <tr>
                <th className={cx(classes.headerCell)}>구분</th>
                <th className={cx(classes.headerCell)}>위치</th>
                <th className={cx(classes.headerCell)}>네트워크 연결상태</th>
                <th className={cx(classes.headerCell)}>속도(Mbps)</th>
                <th className={cx(classes.headerCell)}>사용량(Byte)</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </ScrollArea>
      )}
      {data.length <= 5 && (
        <Table verticalSpacing="xs">
          <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <tr>
              <th className={cx(classes.headerCell)}>구분</th>
              <th className={cx(classes.headerCell)}>위치</th>
              <th className={cx(classes.headerCell)}>네트워크 연결상태</th>
              <th className={cx(classes.headerCell)}>속도(Mbps)</th>
              <th className={cx(classes.headerCell)}>사용량(Byte)</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </Box>
  );
};

export default NIC;

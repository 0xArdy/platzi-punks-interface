import {
  Stack,
  Heading,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  useToast,
  Tag,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import RequestAccess from "../../components/request-access";
import PunkCard from "../../components/punk-card";
import { usePlatziPunkData } from "../../hooks/usePlatziPunksData";
import { useParams } from "react-router-dom";
import Loading from "../../components/loading";
import { useState } from "react";
import usePlatziPunks from "../../hooks/usePlatziPunks";


const Punk = () => {
  const { active, account, library } = useWeb3React();
  const { tokenId } = useParams();
  const { loading, punk, update } = usePlatziPunkData(tokenId);
  const toast = useToast();
  const [transfering, setTransfering] = useState(false);
  const platziPunks = usePlatziPunks();

  const transfer = () => {
    setTransfering(true);
    const address = prompt("Ingresa la direccion: ")

    const isAddress =  library.utils.isAddress(address);

    if(!isAddress) {
      toast({
        title: "Direccion invalida",
        description: 'La direccion no es valida',
        status: 'error'
      })
      setTransfering(false);
    } else {
      platziPunks.methods.safeTransferFrom(punk.owner, address, punk.tokenId).send({
        from: account,
      })
      .on('error', () => {
        setTransfering(false);
      })
      .on('transactionHash', (txHash) => {
        toast({
          title: "transaccion enviada",
          description: txHash,
          status: 'info'
        })
      })
      .on('receipt', () => {
        setTransfering(false)
        toast({
          title: "transaccion confirmada",
          description: `Punks ahora pertenece a ${address}` ,
          status: 'success'
        })
        update();
      })
    }
  }

  if (!active) return <RequestAccess />;

  if (loading) return <Loading />;

  return (
    <Stack
      spacing={{ base: 8, md: 10 }}
      py={{ base: 5 }}
      direction={{ base: "column", md: "row" }}
    >
      <Stack>
        <PunkCard
          mx={{
            base: "auto",
            md: 0,
          }}
          name={punk.name}
          image={punk.image}
        />
        <Button 
          onClick={transfer}
          disabled={account !== punk.owner} 
          colorScheme="green"
          isLoading={transfering}
        >
          {account !== punk.owner ? "No eres el dueño" : "Transferir"}
        </Button>
      </Stack>
      <Stack width="100%" spacing={5}>
        <Heading>{punk.name}</Heading>
        <Text fontSize="xl">{punk.description}</Text>
        <Text fontWeight={600}>
          DNA:
          <Tag ml={2} colorScheme="green">
            {punk.dna}
          </Tag>
        </Text>
        <Text fontWeight={600}>
          Owner:
          <Tag ml={2} colorScheme="green">
            {punk.owner}
          </Tag>
        </Text>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Atributo</Th>
              <Th>Valor</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(punk.attributes).map(([key, value]) => (
              <Tr key={key}>
                <Td>{key}</Td>
                <Td>
                  <Tag>{value}</Tag>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>
    </Stack>
  );
};

export default Punk;